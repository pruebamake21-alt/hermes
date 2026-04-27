import { interpolate, spring, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "./theme";

interface BarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
  value: number;
  index: number;
  frame: number;
}

export const Bar: React.FC<BarProps> = ({
  x,
  y,
  width,
  height,
  color,
  label,
  value,
  index,
  frame,
}) => {
  const { fps } = useVideoConfig();
  const delay = 25 + index * 6;

  const spr = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 15,
      mass: 0.6,
      stiffness: 100,
    },
  });

  const currentHeight = height * spr;

  const labelOpacity = interpolate(frame, [delay + 20, delay + 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const valueOpacity = interpolate(frame, [delay + 10, delay + 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const valueY = interpolate(frame, [delay + 10, delay + 20], [10, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div>
      {/* Bar */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y - currentHeight,
          width,
          height: currentHeight,
          borderRadius: "4px 4px 0 0",
          background: `linear-gradient(180deg, #ffb347 0%, ${color} 50%, #cf4005 100%)`,
          boxShadow: `0 0 20px ${color}66`,
        }}
      />

      {/* Value label */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y - currentHeight - 32,
          width,
          textAlign: "center",
          fontSize: 20,
          fontWeight: 700,
          color: "#ffffff",
          opacity: valueOpacity,
          transform: `translateY(${valueY}px)`,
          textShadow: "0 0 10px rgba(0,0,0,0.5)",
          fontFamily: FONT_FAMILY,
        }}
      >
        +{value}%
      </div>

      {/* X-axis label */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y + 12,
          width,
          textAlign: "center",
          fontSize: 15,
          color: "rgba(255,255,255,0.6)",
          opacity: labelOpacity,
          fontWeight: 500,
          fontFamily: FONT_FAMILY,
        }}
      >
        {label}
      </div>
    </div>
  );
};
