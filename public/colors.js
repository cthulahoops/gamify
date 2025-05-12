export function ensureHexFormat(color) {
  if (typeof color === "string" && color.startsWith("#")) {
    return color;
  }

  const [r, g, b] = rgbString.split(",").map(Number);
  return rgbToHex({ r, g, b });
}

export function rgbToHex({ r, g, b }) {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

export function hexToRgb(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}
