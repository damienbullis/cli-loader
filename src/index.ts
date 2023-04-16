import chalk, { ChalkInstance } from "chalk";
import ansi from "ansi-escapes";
import { exit, stdout } from "process";

// Spinner Characters
const _spinnerChars = ["◜", "◝", "◞", "◟"];

// Helper Functions
type Color = {
  start: [number, number, number];
  end: [number, number, number];
};
function createGradient(
  colors: Color,
  stops: number,
  mode: "rgb" | "bgRgb" = "rgb"
): ChalkInstance[] {
  const gradientArray = [];

  // calculate the step size for each color component
  const rStep = (colors.end[0] - colors.start[0]) / stops;
  const gStep = (colors.end[1] - colors.start[1]) / stops;
  const bStep = (colors.end[2] - colors.start[2]) / stops;

  // interpolate each color component for each stop
  for (let i = 0; i <= stops; i++) {
    const r = Math.round(colors.start[0] + i * rStep);
    const g = Math.round(colors.start[1] + i * gStep);
    const b = Math.round(colors.start[2] + i * bStep);

    gradientArray.push(chalk[mode](r, g, b));
  }

  return gradientArray;
}

const _bgColors = createGradient(
  {
    start: [223, 237, 185],
    end: [244, 133, 255],
  },
  8,
  "bgRgb"
);
const _colors = createGradient(
  {
    start: [223, 237, 185],
    end: [244, 133, 255],
  },
  8,
  "rgb"
);

const _chars = ["█", "▓", " "] as const;

function rotateArrayInPlace(arr: unknown[], k: number) {
  k = k % arr.length;
  if (k === 0) return;

  for (let i = 0; i < k; i++) {
    arr.unshift(arr.pop());
  }
}

const barLength = 8,
  notLoaded = (_colors[0] as ChalkInstance)(_chars[1]),
  speed = 200;

const loadingBar = async (...proms: Promise<unknown>[]) => {
  stdout.write(ansi.eraseLine + ansi.cursorHide + "\n" + ansi.cursorUp(1));
  const progressStep = Math.round((1 / proms.length) * barLength);

  let spinnerIndex = 0,
    colorIndex = 0,
    progress = progressStep;

  const barArr = new Array<number>(barLength).fill(0),
    toggle = [
      [_colors, _chars[0]],
      [_bgColors, _chars[2]],
    ] as const,
    toggleMode: 0 | 1 = 0,
    interval = setInterval(() => {
      let bar = "";
      // Inject Gradient
      if (colorIndex < _colors.length) {
        barArr[0] = _colors.length - colorIndex - 1;
        colorIndex++;
      }
      // Build Loading Bar
      barArr.forEach((c, i) => {
        if (i < progress) {
          const res = toggle[toggleMode][0][c]; // toggle -> _color
          if (res) bar += res(toggle[toggleMode][1]); // toggle -> _chars[0]
        } else {
          bar += notLoaded;
        }
      });

      const percentage = ` ${Math.min(
          Math.round((progress / barLength) * 100),
          100
        )}% `,
        showPercent: "first" | "last" | "none" = "none",
        first = _colors[barArr[0] as number],
        last = _colors[0];

      // Render
      stdout.write(
        "\r" +
          (first
            ? first(
                _spinnerChars[spinnerIndex as keyof typeof _spinnerChars] +
                  " " || ""
              ) + (showPercent === "first" ? first(percentage) : "")
            : "") +
          bar +
          (last && showPercent === "last" ? last(percentage) : "")
      );

      // Update
      rotateArrayInPlace(barArr, 1);
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
  stdout.write(ansi.eraseLine + "\r" + chalk.green("Done!") + "\n\n");

  return results;
};

// Example Usage
// Example Usage
// Example Usage

const main = async () => {
  const res = await loadingBar(
    new Promise((res) => setTimeout(() => res("1"), 3000)),
    new Promise((res) => setTimeout(() => res("2"), 6000)),
    new Promise((res) => setTimeout(() => res("a"), 7000)),
    new Promise((res) => setTimeout(() => res("4"), 10000)),
    new Promise((res) => setTimeout(() => res("5"), 2000)),
    new Promise((res) => setTimeout(() => res("6"), 13000))
  );
  console.log(res);
  exit(0);
};

main();
