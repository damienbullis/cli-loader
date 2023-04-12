import { vi, describe, beforeEach, afterEach, it, expect } from "vitest";
import chalk from "chalk";
import ansi from "ansi-escapes";
import { makeLoadingBar } from "./index.old";

vi.mock("chalk", () => ({
  default: {
    green: vi.fn((str) => str),
    rgb: vi.fn((str) => str),
  },
}));

vi.mock("ansi", () => ({
  eraseLine: "\u001B[2K",
}));

describe("makeLoadingBar", () => {
  const mockFn = vi.fn(() => Promise.resolve("Result"));

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("calls the provided function and returns its result", async () => {
    const loadingBar = makeLoadingBar();
    const result = await loadingBar(mockFn);

    expect(mockFn).toHaveBeenCalled();
    expect(result).toBe("Result");
  });

  it("shows a loading bar while the provided function is running", async () => {
    const loadingBar = makeLoadingBar();
    const promise = loadingBar(mockFn);

    vi.advanceTimersByTime(1000);
    expect(process.stdout.write).toHaveBeenCalledTimes(2); // Once for the loading bar, once for the spinner

    await promise;
  });

  it("shows a completion message when the provided function has completed", async () => {
    const loadingBar = makeLoadingBar({
      showComplete: true,
      completeMessage: "Completed!",
    });
    const promise = loadingBar(mockFn);

    vi.advanceTimersByTime(1000);
    expect(process.stdout.write).toHaveBeenCalledTimes(2); // Once for the loading bar, once for the spinner

    await promise;

    expect(process.stdout.write).toHaveBeenCalledTimes(3); // Once for the completion message
    expect(process.stdout.write).toHaveBeenCalledWith(
      `\r${ansi.eraseLine}${chalk.green("Completed!")}\n`
    );
  });

  it("stops showing the loading bar when the provided function has completed", async () => {
    const loadingBar = makeLoadingBar();
    const promise = loadingBar(mockFn);

    vi.advanceTimersByTime(1000);
    expect(process.stdout.write).toHaveBeenCalledTimes(2); // Once for the loading bar, once for the spinner

    await promise;

    vi.advanceTimersByTime(1000);
    expect(process.stdout.write).toHaveBeenCalledTimes(2); // Should not have been called again
  });
});
