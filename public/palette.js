import { ensureHexFormat } from "./colors.js";

export class Palette {
  constructor() {
    this.color_to_code = new Map();
    this.code_to_color = new Map();
    this.nextColor = "A";
  }

  getColorCode(color) {
    const hexColor = ensureHexFormat(color);

    if (this.color_to_code.has(hexColor)) {
      return this.color_to_code.get(hexColor);
    }

    const code = this.nextColor;
    this.color_to_code.set(hexColor, code);
    this.code_to_color.set(code, hexColor);
    this.nextColor = String.fromCharCode(this.nextColor.charCodeAt(0) + 1);

    return code;
  }

  getColor(code) {
    if (this.code_to_color.has(code)) {
      return this.code_to_color.get(code);
    }
  }

  setColorCode(code, color) {
    const hexColor = ensureHexFormat(color);

    this.color_to_code.set(hexColor, code);
    this.code_to_color.set(code, hexColor);
    if (code > this.nextColor) {
      this.nextColor = String.fromCharCode(code.charCodeAt(0) + 1);
    }
  }

  toJSON() {
    return Array.from(this.code_to_color.entries());
  }

  static fromJSON(json) {
    const palette = new Palette();

    const data = json.color_to_code ?? json;

    for (const [code, color] of data) {
      palette.setColorCode(code, color);
    }

    return palette;
  }
}
