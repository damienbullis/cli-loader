import chalk from "chalk";
import ansi from "ansi-escapes";
import type { ChalkInstance } from "chalk";
import { exit, stdout } from "process";

// create a function to mock a long running process
function mockAsync() {
  return new Promise<boolean>((resolve) => setTimeout(resolve, 5000));
}

//#region Constants

const _spinner = ["◜", "◠", "◝", "◞", "◡", "◟"]; // Spinner animation frames

const makeGradient = (gradient: colorType[]) =>
  gradient.map(([r, g, b]) => chalk.rgb(r, g, b));

// Loading bar starts with the first color in the gradient
const buildLoadingBar = (color: colorType, length: number) =>
  Array.from({ length }, () => {
    return chalk.rgb(...color);
  }) as ChalkInstance[];

//#endregion

const shiftGradient = (
  gradient: ChalkInstance[],
  loadingBar: ChalkInstance[]
) => {
  // Inject gradients
  if (gradient && gradient.length > 0) {
    loadingBar[0] = gradient.shift() as ChalkInstance;
  }
  loadingBar.unshift(loadingBar.pop() as ChalkInstance);
  // Create the loading bar
  const [first, ...rest] = loadingBar as [ChalkInstance, ...ChalkInstance[]];
  const bar = rest.reduce((acc, c) => acc + c("█"), "");
  return [first, bar] as const;
};

let sPos = 0; // Spinner Frame Position
function animationLoop(
  gradient: ChalkInstance[],
  loadingBar: ChalkInstance[],
  showSpinner: boolean
) {
  const [first, bar] = shiftGradient(gradient, loadingBar);
  const frame = first(_spinner[sPos]);
  const spin = showSpinner ? frame + " " : "";
  stdout.write("\r" + spin + bar + ansi.cursorHide);
  sPos = (sPos + 1) % _spinner.length;
}
type colorType = [number, number, number];
type loadingBarOptions = {
  gradient?: colorType[];
  loadingBarLength?: number;
  animationSpeed?: number;
  showSpinner?: boolean;
  showComplete?: boolean;
  completeMessage?: string;
};

const defaultOptions = {
  gradient: [
    [253, 247, 195], // Base Color
    [244, 133, 255], // Head Color
    [244, 164, 255], // ...Tail Colors
    [255, 222, 180],
  ],
  loadingBarLength: 10,
  animationSpeed: 100,
  showSpinner: true,
  showComplete: true,
  completeMessage: "✓ Done!",
} satisfies loadingBarOptions;

function makeLoadingBar(options?: loadingBarOptions) {
  const {
    gradient,
    loadingBarLength,
    animationSpeed,
    showSpinner,
    showComplete,
    completeMessage,
  } = Object.assign({}, defaultOptions, options);

  const _gradient = makeGradient(gradient);
  const _baseGradient = [...(gradient[0] || [255, 255, 255])] as colorType;
  const _loadingBar = buildLoadingBar(_baseGradient, loadingBarLength);

  return async function <T>(fn: () => Promise<T>): Promise<Awaited<T>> {
    const interval = setInterval(
      () => animationLoop(_gradient, _loadingBar, showSpinner),
      animationSpeed
    );

    const result = await fn();

    clearInterval(interval);

    if (showComplete)
      stdout.write("\r" + ansi.eraseLine + chalk.green(completeMessage) + "\n");
    return result;
  };
}

// Example Usage - Create Custom Loading Bar
const loadingBar = makeLoadingBar({
  gradient: [
    [153, 247, 195],
    [144, 133, 255],
    [144, 164, 255],
    [155, 222, 180],
  ],
  showSpinner: false,
  loadingBarLength: 20,
});

// Example Usage - Use Loading Bar
const main = async () => {
  // Simulate wrapping an async function with the loading bar
  await loadingBar(() => mockAsync());
  // Exit After
  exit(0);
};

main();
