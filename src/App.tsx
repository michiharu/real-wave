import React from "react";
import { Layer, Stage } from "react-konva";
import { useWindowSize } from "./hooks";
import Wave from "./Wave";

export const height = 400;
export const waveCount = 5;
const colors: string[] = ["#00f", "#0f0", "#f00", "#0ff", "#f0f"];

function App() {
  const { width } = useWindowSize();
  return (
    <Stage width={width} height={height}>
      <Layer>
        {/* <Rect width={width} height={height} fill="#ccc" /> */}
        {colors.map((color, i) => (
          <Wave key={i} index={colors.length - i - 1} width={width} color={color} />
        ))}
      </Layer>
    </Stage>
  );
}

export default App;
