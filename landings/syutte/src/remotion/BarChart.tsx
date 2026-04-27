import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Bar } from "./Bar";
import { FONT_FAMILY } from "./theme";

interface DataPoint {
  label: string;
  value: number;
  color: string;
}

const data: DataPoint[] = [
  { label: "Inmobiliarias", value: 52, color: "#ff8c42" },
  { label: "Tecnología", value: 68, color: "#f28035" },
  { label: "Finanzas", value: 45, color: "#ea7028" },
  { label: "Salud", value: 38, color: "#e1601c" },
  { label: "Retail", value: 56, color: "#d85010" },
  { label: "Logística", value: 61, color: "#cf4005" },
];

const chartBottom = 760;
const chartLeft = 160;
const chartRight = 960;
const chartWidth = chartRight - chartLeft;
const barWidth = chartWidth / data.length * 0.7;
const barGap = chartWidth / data.length;
const maxValue = 80;

export const BarChart: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 15], [-20, 0], {
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          width: "100%",
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: "#ff8c42",
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 12,
            fontWeight: 600,
            fontFamily: FONT_FAMILY,
          }}
        >
          Datos 2025
        </div>
        <h1
          style={{
            fontSize: 56,
            color: "#ffffff",
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.2,
            fontFamily: FONT_FAMILY,
          }}
        >
          Incremento de Ingresos con IA
        </h1>
        <p
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.5)",
            marginTop: 16,
            opacity: subtitleOpacity,
            fontFamily: FONT_FAMILY,
          }}
        >
          Porcentaje de aumento anual por sector
        </p>
      </div>

      {/* Y-axis labels */}
      {[0, 20, 40, 60, 80].map((val) => {
        const y = chartBottom - (val / maxValue) * 500;
        return (
          <div
            key={val}
            style={{
              position: "absolute",
              left: chartLeft - 60,
              top: y - 8,
              width: 50,
              textAlign: "right",
              fontSize: 14,
              color: "rgba(255,255,255,0.4)",
              fontWeight: 500,
              fontFamily: FONT_FAMILY,
            }}
          >
            {val}%
          </div>
        );
      })}

      {/* Grid lines */}
      {[0, 20, 40, 60, 80].map((val) => {
        const y = chartBottom - (val / maxValue) * 500;
        const gridOpacity = interpolate(frame, [10, 25], [0, 0.15], {
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={`grid-${val}`}
            style={{
              position: "absolute",
              left: chartLeft,
              top: y,
              width: chartWidth,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.15)",
              opacity: gridOpacity,
            }}
          />
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barHeight = (d.value / maxValue) * 500;
        const x = chartLeft + i * barGap + (barGap - barWidth) / 2;

        return (
          <Bar
            key={d.label}
            x={x}
            y={chartBottom}
            width={barWidth}
            height={barHeight}
            color={d.color}
            label={d.label}
            value={d.value}
            index={i}
            frame={frame}
          />
        );
      })}

      {/* Baseline */}
      <div
        style={{
          position: "absolute",
          left: chartLeft,
          top: chartBottom,
          width: chartWidth,
          height: 2,
          backgroundColor: "rgba(255,255,255,0.3)",
        }}
      />
    </AbsoluteFill>
  );
};
