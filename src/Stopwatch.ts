import { performance } from 'perf_hooks';

/**
 * Utility stopwatch for calculating duration on asynchronous execution
 */
export default class Stopwatch {
  #startTime?: number;
  #endTime?: number;

  /**
   * Returns the symbol duration
   * @param type The calculation
   */
  symbolOf(type: number) {
    if (type > 1000) return `${type.toFixed(1)}s`;
    if (type > 1) return `${type.toFixed(1)}ms`;
    return `${type.toFixed(1)}µs`;
  }

  /**
   * Restarts this [[Stopwatch]]
   */
  restart() {
    this.#startTime = performance.now();
    this.#endTime = undefined;
  }

  /**
   * Starts this [[Stopwatch]], calling this function
   * twice will result in a `SyntaxError`.
   */
  start() {
    if (this.#startTime !== undefined) throw new SyntaxError('Stopwatch has already started');

    this.#startTime = performance.now();
  }

  /**
   * Ends this [[Stopwatch]] and returns the duration
   * as a string. Calling this function without calling
   * `Stopwatch#start` will error with a `TypeError`.
   */
  end() {
    if (!this.#startTime) throw new TypeError('Stopwatch has not started');

    this.#endTime = performance.now();
    return this.symbolOf(this.#endTime - this.#startTime);
  }
}
