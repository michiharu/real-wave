import React, { useEffect, useRef, useState } from "react";
import { Shape } from "react-konva";
import { height, waveCount } from "./App";

type Props = {
  index: number;
  width: number;
};

const randomRange = (range: number): number => -range + 2 * range * Math.random();

const waveRandomParams = (am: number, tp: number): [number, number, number, number] => {
  return [am + randomRange(am / 4), tp + randomRange(tp / 4), randomRange(Math.PI), randomRange(0.02)];
};

const generateWaveParams = (): [number, number, number, number][] => {
  return [waveRandomParams(25, 600), waveRandomParams(15, 400), waveRandomParams(10, 200)];
};

function Wave({ index, width }: Props) {
  const startLine = (height * index) / waveCount;
  const [line, setLine] = useState(startLine);
  const lineRef = useRef(line);
  lineRef.current = line;
  const [waveParams] = useState<[number, number, number, number][]>(generateWaveParams());

  useEffect(() => {
    setInterval(() => {
      const nextLine = startLine + performance.now() / 10;
      // if (nextLine < lineRef.current) setWaveParams(generateWaveParams());
      setLine(nextLine);
    }, 20);
    // eslint-disable-next-line
  }, []);

  const opacity = 0.8 - startLine / height;
  const fill = `rgba(0,191,255,${opacity})`;

  return (
    <Shape
      x={0}
      y={0}
      width={width}
      height={height}
      fill={fill}
      sceneFunc={(context, shape) => {
        context.beginPath();
        context.moveTo(0, line);

        for (let x = 0; x <= width; x++) {
          const y = waveParams
            .map(([am, tp, deg, speed]) => am * Math.sin((Math.PI / tp) * (deg + x) + line * speed))
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
