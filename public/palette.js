export class Palette {
  constructor() {
    this.color_to_code = new Map();
    this.code_to_color = new Map();
    this.nextColor = "A";
  }

  getColorCode(color) {
    const hexColor = this.ensureHexFormat(color);

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
    const hexColor = this.ensureHexFormat(color);

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

  ensureHexFormat(color) {
    if (typeof color === "string" && color.startsWith("#")) {
      return color;
    }

    return this.rgbToHex(color);
  }

  rgbToHex(rgbString) {
    const [r, g, b] = rgbString.split(",").map(Number);
    return `#${this.componentToHex(r)}${this.componentToHex(g)}${this.componentToHex(b)}`;
  }

  hexToRgb(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }

  componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }
}
