import React, { useEffect, useMemo, useState } from "react";
import { Shape } from "react-konva";
import { height, waveCount } from "./App";

type Props = {
  index: number;
  width: number;
  color: string;
};

const randomRange = (range: number): number => -range + 2 * range * Math.random();

const waveRandomParams = (am: number, tp: number): [number, number, number, number] => {
  return [am + randomRange(am / 4), tp + randomRange(tp / 4), randomRange(Math.PI), randomRange(0.002)];
};

const generateWaveParams = (): [number, number, number, number][] => {
  return [waveRandomParams(40, 1000), waveRandomParams(20, 600), waveRandomParams(15, 300)];
};

const baseLine = 100;

function Wave({ index, width, color }: Props) {
  const [time, setTime] = useState(performance.now());
  const waveParams = useMemo(generateWaveParams, []);

  useEffect(() => {
    setInterval(() => setTime(performance.now()), 20);
    // eslint-disable-next-line
  }, []);

  const startLine = baseLine + (height - baseLine * 2) * (index / waveCount) + 40 * Math.sin(time * 0.0008);

  return (
    <Shape
      x={0}
      y={0}
      width={width}
      height={height}
      fill={color}
      sceneFunc={(context, shape) => {
        context.beginPath();
        context.moveTo(0, startLine);

        for (let x = 0; x <= width; x++) {
          const y = waveParams
            .map(([am, tp, deg, speed]) => am * Math.sin((Math.PI / tp) * (deg + x) + time * speed))
            .reduce((a, b) => a + b);
          context.lineTo(x, y + startLine);
        }

        context.lineTo(width, 0);
        context.lineTo(0, 0);
        context.fillStrokeShape(shape);
      }}
    />
  );
}

export default Wave;
