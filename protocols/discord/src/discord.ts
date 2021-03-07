import Bus from "@botbus/bus";
import { MessageCommand } from "@botbus/chat";
import SendQueue from "@botbus/sendqueue";
import { Client, Collection, MessageAttachment, TextChannel } from "discord.js";
import { Span, format, Attributes } from "@botbus/format";

export module Discord {
  export function start(token: string) {
    console.log("connecting to discord");
    const discord = new Client();
    const send = new SendQueue();
    send.throttle(1000);

    discord.on("ready", connected);

    return discord.login(token);

    function connected() {
      console.log("connected to discord");
      discord.on("message", ({ guild, channel, member, author, cleanContent, attachments }) => {
        if (channel.type !== "text" || !guild) {
          return; // TODO hmm
        }
        Bus.send("event", "message", "discord", {
          source: {
            gid: guild.id,
            cid: channel.id,
          },
          server: guild.name,
          channel: channel.name,
          nick: member && member.nickname || author.username,
          userId: author.id,
          isMine: author.id === (discord.user && discord.user.id),
          text: getText({ cleanContent, attachments }),
        });
      });
      discord.on("error", (err) => {
        console.error(err);
        process.exit(1);
      });
      Bus.receive<MessageCommand>("command", "message", "discord", ({ source, text, rich }) => {
        const guild = discord.guilds.resolve(source.gid);
        const channel = guild?.channels.resolve(source.cid) as TextChannel;
        if (!guild || !channel) throw new Error("Invalid CID or GID");
        if (channel.type !== "text") throw new Error("Not a text channel.");
        const output = rich ? render(rich) : text;
        send.push(() => channel.send(output))
      });
    }
  }
}

function getText({ cleanContent, attachments }: { cleanContent: string, attachments: Collection<string, MessageAttachment>}) {
  let text = cleanContent;
  if (attachments.size > 0) {
    text += " " + attachments.map(a => a.url).join(" ");
  }
  return text;
}

function render(span: Span) {
  return format(span, (attr, text) =>
    writeCodes(attr) + text + writeCodes(attr));
}

function writeCodes(attr: Attributes) {
  let out = "";
  if (attr.b) out += "**";
  if (attr.i) out += "*";
  if (attr.u) out += "__";
  if (attr.s) out += "~~";
  if (attr.m) out += "`";
  if (attr.x) out += "||";
  return out;
}

export default Discord;
