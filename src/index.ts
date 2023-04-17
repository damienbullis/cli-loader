import ansi from "ansi-escapes";
import { exit, stdout } from "process";

// Characters
const _spinnerChars = ["◜", "◠", "◝", "◞", "◡", "◟"];
const _chars = ["█", "▓", " "] as const;

type rgbFnType = (r: number, g: number, b: number) => (c: string) => string;
const rgb: rgbFnType = (r, g, b) => (c: string) =>
  `\x1B[38;2;${r};${g};${b}m${c}\x1B[39m`;
const bg: rgbFnType = (r, g, b) => (c: string) =>
  `\x1B[48;2;${r};${g};${b}m${c}\x1B[49m`;

// Helper Functions
type GradientProps = {
  start: [number, number, number];
  end: [number, number, number];
  stops: number;
};
type Color = (s: string) => string;
function createGradient({
  start,
  end,
  stops,
}: GradientProps): [Color, ...Color[]] {
  const gradientArray: Color[] = [];

  // calculate the step size for each color component
  const rStep = (end[0] - start[0]) / stops;
  const gStep = (end[1] - start[1]) / stops;
  const bStep = (end[2] - start[2]) / stops;

  // interpolate each color component for each stop
  for (let i = 0; i <= stops; i++) {
    const r = Math.round(start[0] + i * rStep);
    const g = Math.round(start[1] + i * gStep);
    const b = Math.round(start[2] + i * bStep);

    gradientArray.push(bg(r, g, b));
  }
  return gradientArray as [Color, ...Color[]];
}

function rotateArray(arr: unknown[], k: number) {
  k = k % arr.length;
  if (k === 0) return;

  for (let i = 0; i < k; i++) {
    arr.unshift(arr.pop());
  }
}

const defaultOptions = {
  gradient: {
    start: [223, 237, 185],
    end: [244, 133, 255],
    stops: 8,
  },
  length: 8,
  speed: 200,
  showSpinner: true,
  showPercent: false,
  doneMessage: `✓ Done!`,
} satisfies LoadingBarOptions;

type LoadingBarOptions = {
  gradient?: GradientProps;
  length?: number;
  speed?: number;
  showSpinner?: boolean;
  showPercent?: "first" | "last" | false;
  doneMessage?: string;
};

function makeLoadingBar(options: LoadingBarOptions = {}) {
  const { gradient, length, speed, showSpinner, showPercent, doneMessage } = {
      ...defaultOptions,
      ...options,
    },
    _gradient = createGradient(gradient);

  return async (...proms: Promise<unknown>[]) => {
    // Clear the screen
    stdout.write(ansi.eraseLine + ansi.cursorHide + "\n" + ansi.cursorUp(1));

    // Calculate Progress Step
    const progressStep = Math.round((1 / proms.length) * length),
      barArr = new Array<number>(length).fill(0);

    // Initialize
    let spinnerIndex = 0,
      progress = progressStep;

    // Add Gradient
    for (let i = 0; i < _gradient.length; i++) {
      barArr[barArr.length - i] = _gradient.length - 1 - i;
    }

    // Animation Loop
    const interval = setInterval(() => {
        // Generate Loading Bar String
        let bar = "";
        barArr.forEach((c, i) => {
          if (i <= progress) {
            const res = _gradient[c];
            if (res) bar += res(_chars[2]);
          } else {
            bar += rgb(223, 237, 185)(_chars[1]);
          }
        });
        if (barArr[0] == null) return;

        const percentage = ` ${Math.min(
            Math.round((progress / length) * 100),
            100
          )}% `,
          percentFn = rgb(223, 237, 185),
          spinner = showSpinner
            ? percentFn(_spinnerChars[spinnerIndex] + " " || "")
            : "";
        // Render Loading Bar
        stdout.write(
          "\r" +
            spinner +
            (showPercent === "first" ? percentFn(percentage) : "") +
            bar +
            (showPercent === "last" ? percentFn(percentage) : "")
        );

        // Update
        rotateArray(barArr, 1);
        spinnerIndex = (spinnerIndex + 1) % _spinnerChars.length;
      }, speed),
      results: unknown[] = [];

    proms.forEach((p) => {
      p.then((res) => {
        progress += progressStep;
        results.push(res);
      });
    });
    await Promise.all(proms);
    clearInterval(interval);

    stdout.write(
      ansi.eraseLine + "\r" + rgb(56, 229, 77)(doneMessage) + "\n\n"
    );

    return results;
  };
}

/** Primary Loading Bar Function */
const loadingBar = makeLoadingBar();

// Example Usage
// Example Usage
// Example Usage

const main = async () => {
  const res = await loadingBar(
    new Promise(() => {})
    // new Promise((res) => setTimeout(() => res("2"), 3000)),
    // new Promise((res) => setTimeout(() => res("a"), 3000)),
    // new Promise((res) => setTimeout(() => res("4"), 4000)),
    // new Promise((res) => setTimeout(() => res("5"), 5000)),
    // new Promise((res) => setTimeout(() => res("6"), 6000))
  );
  console.log(res);
  exit(0);
};

main();
