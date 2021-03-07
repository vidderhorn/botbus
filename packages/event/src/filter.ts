import { Middleware } from "./compose";

export module Filter {
  export function test<T>(test: (event: T) => boolean): Middleware<T, T> {
    return (event, next) => {
      if (next && test(event))
        next(event);
    };
  }

  export interface TextEvent { text: string }

  export function text<T extends TextEvent>(text: string): Middleware<T, T> {
    return (event, next) => {
      if (event.text !== text) return;
      next && next(event);
    };
  }

  export interface RegexProps { args: string[]; }
  /** Filters to requests where "text" matches given regex. Results stored in event.args. */
  export function regex<T extends TextEvent>(re: RegExp): Middleware<T, T & RegexProps> {
    return (event, next) => {
      const args = re.exec(event.text);
      if (!args) return;
      next && next({ ...event, args });
    };
  }

  export interface PrefixProps { prefix: string; }
  /** Filters to requests where event.text begins with given string. Removes from event.text and stores in event.prefix. */
  export function prefix<T extends TextEvent>(prefix: string): Middleware<T, T & PrefixProps> {
    return (event, next) => {
      if (!event.text || !event.text.startsWith(prefix)) return;
      next && next({
        ...event, prefix,
        text: event.text.substring(prefix.length),
      });
    };
  }

  export interface MineEvent { isMine: boolean; }

  export function mine<T extends MineEvent>(): Middleware<T, T> {
    return test(({ isMine }) => isMine);
  }

  export function notMine<T extends MineEvent>(): Middleware<T, T> {
    return test(({ isMine }) => !isMine);
  }
}
