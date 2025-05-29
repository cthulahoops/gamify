import React from "react";
import { Palette, type Color, type ColorCode } from "./palette";

interface PaletteProps {
  palette: Palette;
  onChange?: (code: ColorCode, newColor: Color) => void;
}

export function PaletteDisplay({ palette, onChange }: PaletteProps) {
  const handleColorChange = (
    code: ColorCode,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (onChange) {
      onChange(code, event.target.value as Color);
    }
  };

  return (
    <div className="palette-grid">
      {Array.from(palette.code_to_color.entries()).map(([code, color]) => (
        <div key={code} className="palette-item">
          <span className="palette-label">{code}:</span>
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(code, e)}
            className="palette-input"
          />
        </div>
      ))}
      <div className="palette-item">+</div>
    </div>
  );
}
