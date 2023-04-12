import chalk from "chalk";
import ansi from "ansi-escapes";
import type { ChalkInstance } from "chalk";
import { exit, stdout } from "process";

// Spinner Characters
const _spinnerChars = ["◜", "◠", "◝", "◞", "◡", "◟"];

// Colors
const _colors = [
  chalk.rgb(253, 247, 195),
  chalk.rgb(255, 222, 180),
  chalk.rgb(244, 164, 255),
  chalk.rgb(244, 133, 255),
];
const _chars = ["█"];
// [charIndex, colorIndex]
const _animation = [
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ],
  [
    [0, 3],
    [0, 0],
    [0, 1],
    [0, 2],
  ],
  [
    [0, 2],
    [0, 3],
    [0, 0],
    [0, 1],
  ],
  [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 0],
  ],
];

const buildBar = (color: ChalkInstance, char: string, i: number) => {
  let bar = "";
  for (let j = 0; j < i; j++) {
    bar += color(char);
  }
  return bar;
};

// Loading Bar

function main() {
  stdout.write(ansi.cursorHide);
  let i = 0;
  const interval = setInterval(() => {
    const bar = _animation[i]!;
    let barStr = "";
    for (let j = 0; j < bar.length; j++) {
      const [charIndex, colorIndex] = bar[j]!;
      const char = _chars[charIndex!]!;
      const color = _colors[colorIndex!]!;
      barStr += color(char);
    }
    stdout.write("\r" + barStr);
    i = (i + 1) % _animation.length;
  }, 200);
  setTimeout(() => {
    clearInterval(interval);
    stdout.write("\r" + ansi.eraseLine + ansi.cursorNextLine + ansi.cursorShow);
    exit();
  }, 5000);
}

main();
