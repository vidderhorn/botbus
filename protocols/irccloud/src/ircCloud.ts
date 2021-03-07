import Bus from "@botbus/bus";
import { MessageCommand } from "@botbus/chat";
import { MultiSendQueue } from "@botbus/sendqueue";
import { FormatIrc } from "@botbus/format-irc";
const IrcCloudConn = require("irccloud");

export interface Options {
  speedLimits?: { [network: string]: number; };
  networkWhitelist?: string[];
}

export interface Source {
  cid: string;
  bid: string;
}

export module IrcCloud {
  export function start(email: string, password: string, options: Options) {
    console.log("connecting to irccloud");
    options = options || {};
    const irc = new IrcCloudConn();
    const send = new MultiSendQueue();
    if (options.speedLimits) {
      Object.entries(options.speedLimits).forEach(([network, limit]) =>
        send.throttle(network, limit));
    }
    irc.on("loaded", connected);
    irc.connect(email, password);
    irc.on("disconnect", process.exit);

    function connected() {
      console.log("connected to irccloud");
      relay("message", (buffer, sender, text) => ({ text }));
      relay("action", (buffer, sender, text) => ({ text }));
      relay("join", (buffer, user) => ({}));
      relay("part", (buffer, user, text) => ({ text }));
      relay("quit", (buffer, user, text) => ({ text }));

      Bus.receive<MessageCommand>("command", "message", "irccloud", ({ source, text, rich }) => {
        const conn = irc.connections[source.cid];
        if (!conn) return; // TODO lol
        const buffer = conn.buffers[source.bid];
        const output = rich ? FormatIrc.render(rich) : text;
        output.split("\n").forEach(line => {
          send.push(conn.name, () => irc.message(conn, buffer.name, line));
        });
      });
    }

    function relay(event: any, props: (...args: any[]) => any) {
      irc.on(event, (buffer: any, sender: any, ...args: any[]) => {
        const conn = irc.connections[buffer.cid];
        if (options.networkWhitelist && !options.networkWhitelist.includes(conn.name)) {
          return;
        }
        Bus.send("event", event, "irccloud", {
          source: { cid: buffer.cid, bid: buffer.bid },
          server: conn.name,
          channel: buffer.name,
          nick: sender.nick,
          userId: sender.nick,
          isMine: sender.nick === irc.nick,
          ...(props(buffer, sender, ...args))
        });
      });
    }
  }
}

export default IrcCloud;
