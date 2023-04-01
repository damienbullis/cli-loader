import chalk from "chalk";
import ansi from "ansi-escapes";
import type { ChalkInstance } from "chalk";
import { exit, stdout } from "process";

// create a function to mock a long running process
function mockAsync() {
  return new Promise<boolean>((resolve) => setTimeout(resolve, 5000));
}

//#region Constants

const spinner = ["◜", "◠", "◝", "◞", "◡", "◟"]; // Spinner animation frames
const loadingBarWidth = 10; // Width of the loading bar in characters
const barGradient = [
  chalk.rgb(253, 247, 195),
  chalk.rgb(244, 133, 255),
  chalk.rgb(244, 164, 255),
  // chalk.rgb(255, 180, 180),
  chalk.rgb(255, 222, 180),
];

const _loadingBar = Array.from({ length: loadingBarWidth }, () => {
  return barGradient[0];
}) as ChalkInstance[];

//#endregion

// TODO: make prop
const shiftGradient = () => {
  // Inject gradients into the loading bar
  if (barGradient && barGradient.length > 0) {
    _loadingBar[0] = barGradient.shift() as ChalkInstance;
  }
  const end = _loadingBar.pop() as ChalkInstance;
  _loadingBar.unshift(end);
  const bar = _loadingBar.map((c) => c("█"));
  return [end, bar.join("")] as const;
};

// Spinner Frame #
let sPos = 0;
// TODO: make prop
function animationLoop() {
  const [first, bar] = shiftGradient();
  const frame = first(spinner[sPos]);
  stdout.write("\r" + frame + " " + bar + ansi.cursorHide);
  sPos = (sPos + 1) % spinner.length;
}

// create a function that takes a function and will run it with a loading bar until that function is done
async function loadingBar<T>(fn: () => Promise<T>) {
  const interval = setInterval(animationLoop, 100);

  const result = (await fn()) as T;

  clearInterval(interval);
  // TODO: make prop
  stdout.write("\r" + ansi.eraseLine + chalk.green("✓ Done!") + "\n");
  return result;
}

const main = async () => {
  // Simulate wrapping an async function with the loading bar
  await loadingBar(() => mockAsync());
  // Exit After
  exit(0);
};

main();
