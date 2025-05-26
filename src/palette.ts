import { parseColor } from "./colors";

export type Color = string & { __brand: "Color" };
export type ColorCode = string & { __brand: "ColorCode" };
export type PaletteData = [ColorCode, Color][];

export class Palette {
  color_to_code: Map<Color, ColorCode>;
  code_to_color: Map<ColorCode, Color>;
  nextColor: ColorCode;

  constructor() {
    this.color_to_code = new Map();
    this.code_to_color = new Map();
    this.nextColor = "A" as ColorCode;
  }

  getColorCode(color: Color): ColorCode {
    if (this.color_to_code.has(color)) {
      return this.color_to_code.get(color)!;
    }

    const code = this.nextColor;
    this.color_to_code.set(color, code);
    this.code_to_color.set(code, color);
    this.nextColor = nextColorCode(code);

    return code;
  }

  hasColorCode(code: string): code is ColorCode {
    return this.code_to_color.has(code as ColorCode);
  }

  getColor(code: ColorCode): Color {
    if (!this.code_to_color.has(code)) {
      throw new Error(`Color code ${code} not found in palette.`);
    }
    return this.code_to_color.get(code)!;
  }

  setColorCode(code: ColorCode, color: Color): void {
    this.color_to_code.set(color, code);
    this.code_to_color.set(code, color);
    if (code > this.nextColor) {
      this.nextColor = nextColorCode(code);
    }
  }

  toJSON(): PaletteData {
    return Array.from(this.code_to_color.entries());
  }

  static fromJSON(data: PaletteData): Palette {
    const palette = new Palette();

    for (const [code, color] of data) {
      palette.setColorCode(code, parseColor(color));
    }

    return palette;
  }
}

function nextColorCode(code: ColorCode): ColorCode {
  return String.fromCharCode(code.charCodeAt(0) + 1) as ColorCode;
}
