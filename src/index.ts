import chalk from "chalk";
import ansi from "ansi-escapes";

const loadingBarWidth = 20; // Width of the loading bar in characters
const spinner = ["◜", "◠", "◝", "◞", "◡", "◟"]; // Spinner animation frames
const gradientStr = Array.from({ length: loadingBarWidth })
  .fill(chalk.cyan("█"))
  .join("");

let lPos = 0; // Current position of the loading bar
let sPos = 0; // Current position of the spinner
function animationLoop() {
  // Get the current spinner frame and loading bar gradient
  const frame = chalk.cyan(spinner[sPos]!);

  // Write the animation to the console
  process.stdout.write("\r" + frame + ` ${gradientStr}` + ansi.cursorHide);
  sPos = (sPos + 1) % spinner.length;

  // Call this function again in 100 milliseconds
  setTimeout(animationLoop, 100);
}

async function main() {
  // Start the animation loop
  animationLoop();

  // Wait 4 seconds and then exit
  await new Promise((resolve) => setTimeout(resolve, 4000));
  console.log(ansi.cursorDown(1) + ansi.cursorLeft + chalk.green("Done!"));

  process.exit(0);
}

main();
