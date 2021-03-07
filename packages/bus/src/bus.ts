import { createClient } from "redis";

const BUS = process.env.BOTBUS || "botbus";
const PORT = parseInt(process.env.BOTBUS_PORT as string) || 6379

export module Bus {
  const pub = createClient(PORT);
  const sub = createClient(PORT);
  sub.setMaxListeners(100000);

  export function send<C>(type: string, signal: string, protocol: string, payload: C): void;
  export function send<C>(type: string, signal: string, protocol: string, network: string, payload: C): void;
  export function send<C>(type: string, signal: string, protocol: string, networkOrPayload: string | C, maybePayload?: C) {
    const channel = [BUS, type, signal, protocol];
    if (maybePayload) channel.push(networkOrPayload as string);
    const payload = maybePayload ? maybePayload as C : networkOrPayload as C;
    const pattern = channel.join(".");
    pub.publish(pattern, JSON.stringify(payload));
  }

  export type Handler<Event> = (e: Event) => any;
  export type Cancel = () => void;

  export function receive<E>(type: string, signal: string, protocol: string, handler: Handler<E>): Cancel;
  export function receive<E>(type: string, signal: string, protocol: string, network: string, handler: Handler<E>): Cancel;
  export function receive<E>(type: string, signal: string, protocol: string, networkOrHandler: string | Handler<E>, maybeHandler?: Handler<E>): Cancel {
    const handler = maybeHandler ? maybeHandler : networkOrHandler as Handler<E>;
    const network = maybeHandler ? networkOrHandler as string : null;
    const listener = sub.on("pmessage", (pattern, channel, payload) => {
      const event = JSON.parse(payload);
      [event.bus, event.type, event.signal, event.protocol, event.network] = channel.split(".");
      try { handler(event); }
      catch (e) { console.log(e); }
    });
    const channel = [BUS, type, signal, protocol];
    if (network) channel.push(network);
    const pattern = channel.join(".");
    sub.psubscribe(pattern);
    return () => {
      sub.unsubscribe(pattern);
    };
  }
}

export default Bus;
