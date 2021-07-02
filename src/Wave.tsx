import React from "react";
import { Shape } from "react-konva";

export type WaveParams = [number, number, number, number];

export type WaveProps = {
  width: number;
  height: number;
  points: number[];
  tailPoints: number[];
  fill: string;
};

function Wave({ width, height, points, tailPoints, fill }: WaveProps) {
  return (
    <Shape
      x={0}
      y={0}
      width={width}
      height={height}
      fill={fill}
      sceneFunc={(context, shape) => {
        context.beginPath();
        context.moveTo(0, tailPoints[0]);
        tailPoints.forEach((y, x) => context.lineTo(x, y));
        points.reverse().forEach((y, x) => context.lineTo(width - x, y));
        context.fillStrokeShape(shape);
      }}
    />
  );
}

export default Wave;
