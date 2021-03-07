import { format, Span, Attributes } from "@botbus/format";

export module FormatIrc {
  export const BOLD = "\x02";
  export const ITALIC = "\x1D";
  export const MONOSPACE = "\x11";
  export const UNDERLINE = "\x1F";
  export const STRIKE = "\x1E";
  export const COLOR = "\x03";

  export function render(span: Span): string {
    return format(span, (attr, text) => {
      let out = writeCodes(attr, false);
      out += text;
      out += writeCodes(attr, true);
      return out;
    });
  }

  function writeCodes(attr: Attributes, close: boolean): string {
    let out = "";
    if (attr.b) out += BOLD;
    if (attr.i) out += ITALIC;
    if (attr.m) out += MONOSPACE;
    if (attr.s) out += STRIKE;
    if (attr.c || attr.h) out += COLOR;
    if (close) return out;
    if (attr.c) out += attr.c;
    if (attr.h) out += "," + attr.h;
    return out;
  }
}
