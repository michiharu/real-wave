import React, { useEffect, useState } from "react";
import { Layer, Rect, Stage } from "react-konva";
import { useWindowSize } from "./hooks";
import Sparkle, { SparkleProps } from "./Sparkle";
import Wave, { WaveParams, WaveProps } from "./Wave";

const waveCount = 6;
const whiteRate = 0.7;
const disappearRate = 0.76;
const slowDownRate = 0.6;

const sparkleCount = 100;
const lifespan = 1000;

const randomRange = (range: number): number => -range + 2 * range * Math.random();
const randomInt = (int: number): number => Math.floor(int * Math.random());
const randomIntWeighted = (weights: number[]): number => {
  const rand = Math.random();
  return weights.map((r) => rand < r).indexOf(true);
};

const waveRandomParams = (am: number, tp: number): WaveParams => {
  return [am + randomRange(am / 4), tp + randomRange(tp / 4), randomRange(Math.PI), randomRange(0.0005)];
};

const generateWaveParams = (): WaveParams[] => {
  return [
    waveRandomParams(25, 610),
    waveRandomParams(20, 470),
    waveRandomParams(10, 230),
    waveRandomParams(0.5, 29),
    waveRandomParams(0.5, 23),
    waveRandomParams(0.5, 19),
  ];
};

const calcPoints = (width: number, line: number, endLine: number, params: WaveParams[]): number[] => {
  const slowDownLine = endLine * slowDownRate;
  const maxRemain = endLine - slowDownLine;
  const remain = line - slowDownLine;
  return [...Array(width + 1)].map((_, x) => {
    const y = params
      .map(([am, tp, deg, speed]) => am * Math.sin((Math.PI / tp) * (deg + x) + line * am * speed))
      .reduce((a, b) => a + b);
    if (remain < 0) return y + line - 50;
    return y + slowDownLine + remain * Math.cos((Math.PI * remain * 0.45) / maxRemain) - 50;
  });
};

const bottomPoints = (width: number): number[] => [...Array(width + 1)].map(() => 0);

const calcColor = (a: number, b: number, rate: number): number => {
  return Math.ceil(a + (b - a) * rate);
};

const calcRGB = (a: RGB, b: RGB, rate: number): RGB => {
  return [calcColor(a[0], b[0], rate), calcColor(a[1], b[1], rate), calcColor(a[2], b[2], rate)];
};

type RGB = [number, number, number];
const wave1: RGB = [0, 96, 161];
const wave2: RGB = [102, 244, 255];
const wave3: RGB = [200, 250, 255];
const wave4: RGB = [132, 132, 132];

const calcFill = (line: number, endLine: number): [string, number] => {
  const rate = line / endLine;
  if (rate < whiteRate) {
    const [r, g, b] = calcRGB(wave1, wave2, rate / whiteRate);
    return [`rgba(${r},${g},${b},1)`, 1];
  }

  if (rate < disappearRate) {
    const [r, g, b] = calcRGB(wave2, wave3, (rate - whiteRate) / (disappearRate - whiteRate));
    return [`rgba(${r},${g},${b},1)`, 1];
  }
  const [r, g, b] = calcRGB(wave3, wave4, (rate - disappearRate) / (1 - disappearRate));
  const o = (1 - rate) / (1 - disappearRate);
  return [`rgba(${r},${g},${b},${o})`, o];
};

type WaveState = { line: number; params: WaveParams[]; fill: string; opacity: number };
type SparkleState = { wIndex: number; x: number; yDelta: number; sides: number; life: number; radius: number };

const initialWavesState = (endLine: number): WaveState[] => {
  return [...Array(waveCount)].map((_, i) => {
    const line = (endLine * i) / waveCount;
    const [fill, opacity] = calcFill(line, endLine);
    return { line, params: generateWaveParams(), fill, opacity };
  });
};

const generatorSparkleState = (width: number, beforeLife?: number): SparkleState => {
  const weights = [0.3, 0.7, 0.9, 0.96, 0.98, 1];
  if (weights.length !== waveCount) throw new Error();
  const wIndex = randomIntWeighted(weights);
  const x = randomInt(width + 1);
  const yDelta = 10 - wIndex * 2 + randomRange(20);
  const sides = 5 + randomInt(3);
  const life = beforeLife ?? randomInt(lifespan);
  const radius = 2 + randomInt(8);
  return { wIndex, x, yDelta, sides, life, radius };
};

const initialSparklesState = (width: number): SparkleState[] => {
  return [...Array(sparkleCount)].map(() => generatorSparkleState(width));
};

function App() {
  const { width, height } = useWindowSize();
  const endLine = height * 0.8;
  const [times, setTimes] = useState<[number, number]>([performance.now(), performance.now()]);
  const [wavesState, setWavesState] = useState<WaveState[]>(initialWavesState(endLine));
  const [sparklesState, setSparklesState] = useState<SparkleState[]>(initialSparklesState(width));

  useEffect(() => {
    setInterval(() => setTimes((state) => [performance.now(), state[0]]), 50);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const elapsed = times[0] - times[1];
    setWavesState((state) => {
      let needSwap = false;
      const waves = state.map((w) => {
        const line = (w.line + elapsed / 25) % endLine;
        if (line < w.line) needSwap = true;
        const params = line < w.line ? generateWaveParams() : w.params;
        const [fill, opacity] = calcFill(line, endLine);
        return { line, params, fill, opacity };
      });
      if (!needSwap) return waves;
      return [waves[waves.length - 1], ...waves.slice(0, waves.length - 1)];
    });
    setSparklesState((state) =>
      state.map((s) => {
        const life = s.life - elapsed;
        if (life < 0) return generatorSparkleState(width, lifespan - life);
        return { ...s, life };
      })
    );
  }, [times, endLine, width]);

  const wavePoints: number[][] = wavesState.map(({ line, params }) => calcPoints(width, line, endLine, params));

  const waveProps: (WaveProps & { opacity: number })[] = wavesState
    .map(({ fill, opacity }, i) => ({
      width,
      height,
      points: wavePoints[i],
      tailPoints: i === 0 ? bottomPoints(width) : wavePoints[i - 1],
      fill,
      opacity,
    }))
    .reverse();

  const sparkleProps: SparkleProps[] = sparklesState.map((s) => {
    const { wIndex, yDelta, life, ...other } = s;
    const wave = waveProps[s.wIndex];
    const y = wave.points[s.x] - yDelta;
    const opacity = (wave.opacity * life) / lifespan;
    const radius = (1 - opacity) * s.radius;
    return { ...other, y, opacity, radius };
  });

  return (
    <Stage width={width} height={height}>
      <Layer>
        <Rect width={width} height={height} fill="#ddc" />
        {waveProps.map((p, i) => (
          <Wave key={i} {...p} />
        ))}
        {sparkleProps.map((s, i) => (
          <Sparkle key={i} {...s} />
        ))}
      </Layer>
    </Stage>
  );
}

export default App;
