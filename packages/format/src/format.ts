export interface Span {
  at: Attributes;
  ch: Child[];
}

export interface Block {
  attr: Attributes;
  text: string;
}

export type Child = Span | string;

export type Content = Child | Partial<Attributes> | number | boolean | null | undefined;

export interface Attributes {
  c?: number;
  h?: number;
  b?: boolean;
  i?: boolean;
  u?: boolean;
  s?: boolean;
  m?: boolean;
  x?: boolean;
  f?: string;
}

export function strip(span: Span): string {
  return span.ch.map(c => {
    if (typeof c === "string") return c;
    else return strip(c);
  }).join("");
}

export function nerf(s: string) {
  return s[0] + String.fromCharCode(0x200B) + s.substring(1);
}

export function format(span: Span, render: (attr: Attributes, text: string) => string): string {
  let out = "";
  for (const child of span.ch) {
    if (typeof child === "string") {
      out += render(span.at, child);
    }
    else {
      out += format({
        at: { ...span.at, ...child.at },
        ch: child.ch 
      }, render);
    }
  }
  return out;
}

export function span(...contents: Content[]) {
  const span: Span = {
    at: {},
    ch: [],
  };
  for (const c of contents) {
    if (c === null || c === undefined || typeof c === "boolean") {
    }
    else if (typeof c === "string" || typeof c === "number") {
      if (typeof span.ch[span.ch.length - 1] === "string") {
        span.ch[span.ch.length - 1] += c.toString();
      }
      else {
        span.ch.push(c.toString());
      }
    }
    else if ("ch" in c) {
      span.ch.push(c);
    }
    else {
      Object.assign(span.at, c);
    }
  }
  return span;
}

export function bold(...contents: Content[]) { return span(bold, ...contents); }
bold.b = true;

export function italic(...contents: Content[]) { return span(italic, ...contents); }
italic.i = true;

export function underline(...contents: Content[]) { return span(underline, ...contents); }
underline.u = true;

export function strike(...contents: Content[]) { return span(strike, ...contents); }
strike.s = true;

export function monospace(...contents: Content[]) { return span(monospace, ...contents); }
monospace.m = true;

export function spoiler(...contents: Content[]) { return span(spoiler, ...contents); }
spoiler.x = true;

export function block(format: string, ...contents: Content[]) { return span({ f: format }, ...contents); }

export enum Colors {
  white = 0,
  black = 1,
  blue = 2,
  green = 3,
  red = 4,
  brown = 5,
  magenta = 6,
  orange = 7,
  yellow = 8,
  lime = 9,
  cyan = 10,
  teal = 11,
  sky = 12,
  pink = 13,
  gray = 14,
  silver = 15,
}

export function white(...contents: Content[]) { return span(white, ...contents); }
white.c = Colors.white;

export function black(...contents: Content[]) { return span(black, ...contents); }
black.c = Colors.black;

export function blue(...contents: Content[]) { return span(blue, ...contents); }
blue.c = Colors.blue;

export function green(...contents: Content[]) { return span(green, ...contents); }
green.c = Colors.green;

export function red(...contents: Content[]) { return span(red, ...contents); }
red.c = Colors.red;

export function brown(...contents: Content[]) { return span(brown, ...contents); }
brown.c = Colors.brown;

export function orange(...contents: Content[]) { return span(orange, ...contents); }
orange.c = Colors.orange;

export function yellow(...contents: Content[]) { return span(yellow, ...contents); }
yellow.c = Colors.yellow;

export function lime(...contents: Content[]) { return span(lime, ...contents); }
lime.c = Colors.lime;

export function cyan(...contents: Content[]) { return span(cyan, ...contents); }
cyan.c = Colors.cyan;

export function teal(...contents: Content[]) { return span(teal, ...contents); }
teal.c = Colors.teal;

export function sky(...contents: Content[]) { return span(sky, ...contents); }
sky.c = Colors.sky;

export function pink(...contents: Content[]) { return span(pink, ...contents); }
pink.c = Colors.pink;

export function gray(...contents: Content[]) { return span(gray, ...contents); }
gray.c = Colors.gray;

export function silver(...contents: Content[]) { return span(silver, ...contents); }
silver.c = Colors.silver;

