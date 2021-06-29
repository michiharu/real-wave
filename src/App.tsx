import React from "react";
import { Layer, Rect, Stage } from "react-konva";
import { useWindowSize } from "./hooks";
import Wave from "./Wave";

export const height = 1000;
export const waveCount = 4;

function App() {
  const { width } = useWindowSize();
  return (
    <Stage width={width} height={height}>
      <Layer>
        <Rect width={width} height={height} fill="#ccc" />
        {[...Array(waveCount)].map((_, i) => (
          <Wave key={i} index={i} width={width} />
        ))}
      </Layer>
    </Stage>
  );
}

export default App;
