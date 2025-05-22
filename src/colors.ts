type Color = string & { __brand: "Color" };
type RgbColor = { r: number; g: number; b: number };

export function rgbToHex({ r, g, b }: RgbColor): Color {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}` as Color;
}

export function hexToRgb(hexColor: Color): RgbColor {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return { r, g, b };
}

function componentToHex(c: number) {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

export function getForegroundColor(color: Color): Color {
  const { r, g, b } = hexToRgb(color);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return (brightness > 128 ? "#000000" : "#FFFFFF") as Color;
}

export function isSimilar(color1: Color, color2: Color) {
  const { r: r1, g: g1, b: b1 } = hexToRgb(color1);
  const { r: r2, g: g2, b: b2 } = hexToRgb(color2);
  const threshold = 150;
  const manhattanDistance =
    Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
  return manhattanDistance < threshold;
}
