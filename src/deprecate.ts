
/**
 * Extracts all arguments and returns as a tuple from {@link F}.
 */
export type ExtractArguments<F> = F extends (...args: infer U) => any ? U : never;

/**
 * Namespace to deprecate functions, methods, properties, etc.
 */
// eslint-disable-next-line
export namespace deprecate {
  /**
   * Deprecates a function from being used, it'll emit a warning using [process.emitWarning](https://nodejs.org/api/process.html#process_process_emitwarning_warning_options).
   *
   * @example
   * ```js
   * const { deprecate: { func: deprecateFunction } } = require('the-shelf');
   *
   * const myFunc = deprecateFunction(() => {
   *    return 'owo';
   * }, '`myFunc` is deprecated and will be removed in a future release.', ['someOtherFunc']);
   * ```
   *
   * @param f The function to use that is deprecated.
   * @param message An alternative message instead of `Function myFunc is deprecated and will be removed in a future release.`
   * @param alternatives A list of alternative functions that will be printed.
   * @returns The function that will be ran BUT it'll emit a warning message.
   */
  export function func<F extends (...args: any[]) => any, U extends any[] = ExtractArguments<F>, R = ReturnType<F>>(
    f: F,
    message?: string | ((name: string, alternatives?: string[]) => string),
    alternatives?: string[]
  ): (...args: U) => R {
    return function (this: any, ...args: U) {
      const msg =
        message !== undefined
          ? typeof message === 'string'
            ? message
            : message(f.name || '<anonymous>', alternatives)
          : `Function ${f.name || '<anonymous>'} is deprecated and will be removed in a later release.${
              alternatives !== undefined
                ? ` You can also try the alternatives of ${f.name || '<anonymous function>'}: ${alternatives.join(
                    ', '
                  )}`
                : ''
            }`;

      process.emitWarning(msg, {
        code: 'DEPRECATION',
      });

      return f.call(this, ...args);
    };
  }

  /**
   * Decorator for deprecating a class that shouldn't be in-use.
   *
   * @example
   * ```ts
   * // This requires TypeScript since decorators are still in-proposal.
   * import { deprecate } from 'the-shelf';
   *
   * (at)deprecate.Class((name, alternatives) => `Try out ${alternatives?.join(', ')}.`, ['owo', 'uwu'])
   * class SomeClass {}
   * ```
   *
   * @param message An alternative message instead of `Class "SomeClass" is deprecated and will be removed in a future release.`
   * @param alternatives A list of alternative classes to print out.
   * @returns The decorator hook to apply.
   */
  export const Class =
    (message?: string | ((name: string, alternatives?: string[]) => string), alternatives?: string[]): ClassDecorator =>
    (target) => {
      const msg =
        message !== undefined
          ? typeof message === 'string'
            ? message
            : message(target.name || '<anonymous cls>', alternatives)
          : `Class ${target.name || '<anonymous cls>'} is deprecated and will be removed in a later release.${
              alternatives !== undefined
                ? ` You can also try the alternatives of ${target.name || '<anonymous cls>'}: ${alternatives.join(
                    ', '
                  )}`
                : ''
            }`;

      process.emitWarning(msg, {
        code: 'DEPRECATION',
      });
    };
}
