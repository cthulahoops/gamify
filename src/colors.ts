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
