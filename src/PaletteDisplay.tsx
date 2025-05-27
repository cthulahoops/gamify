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
    <div>
      {Array.from(palette.code_to_color.entries()).map(([code, color]) => (
        <div key={code}>
          <label>
            {code}:
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(code, e)}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
