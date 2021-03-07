import Bus from "@botbus/bus";
import { compose, Middleware } from "@botbus/event";

export type ChatEvent =
| MessageEvent
| JoinEvent
| PartEvent;

export module Chat {
  export function on<E extends ChatEvent>(event: E["signal"]) {
    return on;

    function on<T2>(m1: Middleware<E, T2>): void;
    function on<T2, T3>(m1: Middleware<E, T2>, m2: Middleware<T2, T3>): void;
    function on<T2, T3, T4>(m1: Middleware<E, T2>, m2: Middleware<T2, T3>, m3: Middleware<T3, T4>): void;
    function on<T2, T3, T4, T5>(m1: Middleware<E, T2>, m2: Middleware<T2, T3>, m3: Middleware<T3, T4>, m4: Middleware<T4, T5>): void;
    function on<T2, T3, T4, T5, T6>(m1: Middleware<E, T2>, m2: Middleware<T2, T3>, m3: Middleware<T3, T4>, m4: Middleware<T4, T5>, m5: Middleware<T5, T6>): void;
    function on<T2, T3, T4, T5, T6, T7>(m1: Middleware<E, T2>, m2: Middleware<T2, T3>, m3: Middleware<T3, T4>, m4: Middleware<T4, T5>, m5: Middleware<T5, T6>, m6: Middleware<T6, T7>): void;
    function on<T2, T3, T4, T5, T6, T7, T8>(m1: Middleware<E, T2>, m2: Middleware<T2, T3>, m3: Middleware<T3, T4>, m4: Middleware<T4, T5>, m5: Middleware<T5, T6>, m6: Middleware<T6, T7>, m7: Middleware<T7, T8>): void;
    function on<T2, T3, T4, T5, T6, T7, T8, T9>(m1: Middleware<E, T2>, m2: Middleware<T2, T3>, m3: Middleware<T3, T4>, m4: Middleware<T4, T5>, m5: Middleware<T5, T6>, m6: Middleware<T6, T7>, m7: Middleware<T7, T8>, m8: Middleware<T8, T9>): void;
    function on<T2, T3, T4, T5, T6, T7, T8, T9, T10>(m1: Middleware<E, T2>, m2: Middleware<T2, T3>, m3: Middleware<T3, T4>, m4: Middleware<T4, T5>, m5: Middleware<T5, T6>, m6: Middleware<T6, T7>, m7: Middleware<T7, T8>, m8: Middleware<T8, T9>, m9: Middleware<T9, T10>): void;
    function on<T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(m1: Middleware<E, T2>, m2: Middleware<T2, T3>, m3: Middleware<T3, T4>, m4: Middleware<T4, T5>, m5: Middleware<T5, T6>, m6: Middleware<T6, T7>, m7: Middleware<T7, T8>, m8: Middleware<T8, T9>, m9: Middleware<T9, T10>, m10: Middleware<T10, T11>): void;
    function on(...wares: [Middleware<E, any>, ...Middleware<any, any>[]]): void {
      const handler = compose(...wares as [Middleware<any, any>]);
      Bus.receive("event", event, "*", event => {
        return handler(event);
      });
    }
  }
}

export interface MessageOptions {
  tts?: boolean;
  rich?: any;
}

export module Send {
  export function message(protocol: string, source: any, text: string, options: MessageOptions = {}) {
    Bus.send<MessageCommand>("command", "message", protocol, { source, text, ...options });
  }

  export function messageNetwork(protocol: string, network: string, source: any, text: string, options: MessageOptions = {}) {
    Bus.send<MessageCommand>("command", "message", protocol, network, { source, text, ...options });
  }

  export function reply({ protocol, network, source }: MessageEvent, text: string, options: MessageOptions = {}) {
    if (network) messageNetwork(protocol, network, source, text, options);
    else message(protocol, source, text, options);
  }
}

export interface AllChatCommands {
  bus: string;
  type: "command";
  protocol: string;
}

export interface MessageCommand {
  source: any;
  text: string;
  rich?: any;
  tts?: boolean;
}

export module Reply {
  export function message<T extends MessageEvent>(fn: (m: T) => any): Middleware<T, any> {
    return async (event) => {
      if (event.isMine) return;
      const text = await Promise.resolve(fn(event));
      Send.reply(event, text)
    };
  }
}

export interface AllChatEvents {
  bus: string;
  type: "event";
  protocol: string;
  network?: string;
  source: any;
  server: string;
  isMine: boolean;
}

export interface ChannelEvent extends AllChatEvents {
  channel: string;
  nick: string;
  userId: string;
}

export interface MessageEvent extends ChannelEvent {
  signal: "message";
  text: string;
}

export interface JoinEvent extends ChannelEvent {
  signal: "join";
}

export interface PartEvent extends ChannelEvent {
  signal: "part";
  text: string;
}

export interface QuitEvent extends ChannelEvent {
  signal: "quit";
  text: string;
}
