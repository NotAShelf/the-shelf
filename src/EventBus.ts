/** Represents a generic listener */
export type Listener = (...args: any[]) => void;

/** Represents the arguments if `L` is a `Listener` or just use `any` if not */
export type ListenerArgs<L> = L extends Listener ? Parameters<L> : any[];

/** Represents a object of a default EventBus' listeners */
export interface EventBusMap {
  [P: string]: Listener;
}

/** Represents the listeners object */
export interface ListenerObject {
  [P: string]: Listener[];
}

/**
 * Represents a EventBus, an emittion tool to pass down data from one component to another
 */
export default class EventBus<O extends {} = EventBusMap> {
  #maxListenerSize: number = 250;
  #listeners: ListenerObject = {};

  /**
   * Emits a new event from the callstack
   * @param event The event to emit
   * @param args Any additional arguments to push
   * @returns A boolean value if it exists or not
   */
  emit<K extends keyof O>(event: K, ...args: ListenerArgs<O[K]>) {
    if (!this.#listeners.hasOwnProperty(event)) return false;

    const listeners = this.#listeners[event as string];
    if (!listeners.length) return false;

    for (let i = 0; i < listeners.length; i++) {
      // Preserve async stack this way
      (async () => {
        await listeners[i](...args);
      })();
    }

    return true;
  }

  /**
   * Sets the maximum amount of listeners to append
   *
   * @param count The max size to use, If value `-1` is used, it'll
   * be infinite and might lead to callstack errors.
   *
   * @returns This instance to chain methods
   */
  setMaxListeners(count: number) {
    if (count === -1)
      console.warn(
        `(the-shelf:${process.pid}) Notice: You have set the count to \`-1\`, this is not recommended and can cause callstack errors.`
      );

    this.#maxListenerSize = count;
    return this;
  }

  /**
   * Pushes a new event to the callstack
   *
   * @param event The event to push
   * @param listener The listener function
   * @returns This instance to chain methods
   */
  on<K extends keyof O>(event: K, listener: O[K]) {
    const listeners = this.#listeners[event as string] ?? [];

    if (this.#maxListenerSize !== -1 && listeners.length > this.#maxListenerSize)
      throw new RangeError(`Reached the maximum amount of listeners to append (event=${event})`);

    listeners.push(listener as any);
    this.#listeners[event as string] = listeners;

    return this;
  }

  /**
   * Pushes a new event to the callstack and removes it after
   * it has been emitted from the parent component.
   *
   * @param event The event to push
   * @param listener The listener function
   * @returns This instance to chain methods
   */
  once<K extends keyof O>(event: K, listener: O[K]) {
    const onceListener: any = (...args: any[]) => {
      (listener as any)(...args);
      return this.removeListener(event, onceListener);
    };

    return this.on(event, onceListener);
  }

  /**
   * Pushes a event's specific listener from the callstack.
   * @param event The event to remove
   * @param listener The listener callback function
   * @returns This instance to chain methods
   */
  removeListener<K extends keyof O>(event: K, listener: O[K]) {
    if (!this.#listeners.hasOwnProperty(event)) return false;

    const listeners = this.#listeners[event as string];
    if (!listeners.length) return false;

    const index = listeners.indexOf(listener as any);
    if (index !== -1) listeners.splice(index, 1);

    this.#listeners[event as string] = listeners;
    return true;
  }

  /**
   * Returns how many listeners a event has
   * @param event The event to lookup
   * @returns A number of how many concurrent listeners are in
   */
  size<K extends keyof O>(event: K): number;

  /**
   * Returns how many events are in this EventBus component
   */
  size(): number;
  size(event?: string) {
    if (event !== undefined) {
      const listeners = this.#listeners[event];
      if (!listeners.length) return 0;

      return listeners.length;
    }

    return Object.keys(this.#listeners).length;
  }

  /**
   * Removes all listeners from this EventBus component
   */
  removeAllListeners() {
    this.#listeners = {};
    return this;
  }

  /**
   * @inheritdoc
   */
  addListener<K extends keyof O>(event: K, listener: O[K]) {
    return this.on(event, listener);
  }
}
