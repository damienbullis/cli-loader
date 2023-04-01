import chalk from "chalk";
import ansi from "ansi-escapes";

// Could do it something like this as well...
// const b = [
//   5,
//   4,
//   3,
//   2,
//   1,
//   0,
//   0,
//   0,
//   0,
//   0,
// ]

const spinner = ["◜", "◠", "◝", "◞", "◡", "◟"]; // Spinner animation frames
const loadingBarWidth = 10; // Width of the loading bar in characters
const barGradient = [
  chalk.rgb(253, 247, 195),
  chalk.rgb(255, 222, 180),
  chalk.rgb(255, 180, 180),
  chalk.rgb(244, 164, 255),
  chalk.rgb(244, 133, 255),
] as const;

const _loadingBar = Array.from({ length: loadingBarWidth }, (_, i) => {
  const diff = loadingBarWidth - barGradient.length;
  if (i >= diff) {
    return barGradient[i - diff]!;
  } else {
    return barGradient[0];
  }
});

const loadingBar = () => {
  const end = _loadingBar.pop()!;
  _loadingBar.unshift(end);
  const bar = _loadingBar.map((c) => c("█"));
  return [end, bar.join("")] as const;
};

// Spinner Frame #
let sPos = 0;
function animationLoop() {
  const [first, bar] = loadingBar();
  const frame = first(spinner[sPos]);

  process.stdout.write("\r" + frame + " " + bar + ansi.cursorHide);
  sPos = (sPos + 1) % spinner.length;
}

async function main() {
  // Start the animation loop
  const interval = setInterval(animationLoop, 100);

  await new Promise((resolve) => setTimeout(resolve, 4000));

  // End
  console.log(ansi.cursorDown(1) + ansi.cursorLeft + chalk.green("Done!"));
  process.exit(0);
}

main();
