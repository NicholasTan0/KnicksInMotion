import { useState } from "react";

function ColorPicker({ startColor, setStartColor, endColor, setEndColor }) {
  return (
    <div className="flex items-center relative w-min">
      <input
        title="Change starting color"
        type="color"
        value={startColor}
        onChange={(e)=>setStartColor(e.target.value)}
        className="h-10 w-16 cursor-pointer appearance-none border-2 border-neutral-400 border-r-0 bg-transparent p-0 
         [&::-webkit-color-swatch-wrapper]:p-0 
         [&::-webkit-color-swatch]:border-none 
         [&::-moz-color-swatch]:border-none" 
      />
      
      <div
        className="absolute left-[50%] translate-x-[-50%] h-9 w-1/2 border-neutral-400 pointer-events-none"
        style={{ 
          background: `linear-gradient(to right, ${startColor}, ${endColor})`,
        }}
      >
      </div>

      <input
        title="Change ending color"
        type="color"
        value={endColor}
        onChange={(e)=>setEndColor(e.target.value)}
        className="h-10 w-16 cursor-pointer appearance-none border-2 border-neutral-400 border-l-0 bg-transparent p-0 
         [&::-webkit-color-swatch-wrapper]:p-0 
         [&::-webkit-color-swatch]:border-none
         [&::-moz-color-swatch]:border-none" 
      />
    </div>
  );
}

export default ColorPicker;
