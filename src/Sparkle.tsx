import React from "react";
import { RegularPolygon } from "react-konva";

export type WaveParams = [number, number, number, number];

export type SparkleProps = {
  x: number;
  y: number;
  sides: number;
  radius: number;
  opacity: number;
};

function Sparkle(props: SparkleProps) {
  return <RegularPolygon {...props} fill="#fff" />;
}

export default Sparkle;
