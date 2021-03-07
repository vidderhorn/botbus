import Bus from "@botbus/bus";
import { MessageCommand, MessageEvent } from "@botbus/chat";
import SendQueue from "@botbus/sendqueue";
import { FormatIrc } from "@botbus/format-irc";
const { Client } = require("irc-framework");

const BUS = process.env.BOTBUS || "botbus";

export module Irc {
  // TODO: more options
  export interface Options {
    throttle?: number;
    nick?: string;
    username?: string;
    realname?: string;
    host?: string;
    port?: number;
    secure?: boolean;
    selfSigned?: boolean;
    version?: string;
    channels?: string[];
  }

  export const defaults: Options = {
    throttle: 1000,
    nick: BUS,
    username: BUS,
    realname: BUS,
    host: "localhost",
    secure: false,
    selfSigned: false,
    port: 6667,
    version: BUS,
    channels: [],
  };

  export function start(network: string, options: Options = {}) {
    console.log(`connecting to ${network} irc`);
    const op = Object.assign({}, defaults, options);
    const irc = new Client();
    const send = new SendQueue();
    send.throttle(op.throttle!);

    irc.connect({
      auto_reconnect: false,
      host: op.host,
      port: op.port,
      nick: op.nick,
      username: op.username,
      gecos: op.realname,
      version: op.version,
      tls: op.secure,
      rejectUnauthorized: !op.selfSigned
    });

    irc.on("registered", () => {
      console.log(`connected to ${network} irc`);
      
      for (const channel of op.channels!) {
        irc.join(channel);
      }
    });

    irc.on("close", () => process.exit());

    irc.on("privmsg", ({ nick, target, message }: any) => {
      Bus.send("event", "message", "irc", network, {
        source: { target },
        server: network,
        channel: target,
        nick: nick,
        userId: nick,
        isMine: nick === irc.nick,
        text: message
      });
    });

    Bus.receive<MessageCommand>("command", "message", "irc", network, ({ source, text, rich }) => {
      const output = rich ? FormatIrc.render(rich) : text;
      for (const line of output.split("\n")) {
        send.push(() => irc.say(source.target, line));
      }
    });
  }
}
