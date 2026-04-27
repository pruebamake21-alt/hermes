import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { FONT_FAMILY, COLORS } from "./theme";

function useAppear(
  frame: number,
  startFrame: number,
  fps: number,
  overshoot = false
) {
  const spr = spring({
    frame: frame - startFrame,
    fps,
    config: overshoot
      ? { damping: 12, mass: 0.7, stiffness: 100 }
      : { damping: 18, mass: 0.8, stiffness: 120 },
  });
  const opacity = interpolate(frame, [startFrame, startFrame + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { scale: spr, opacity };
}

function DetailRow({
  label,
  value,
  frame,
  startFrame,
  fps,
}: {
  label: string;
  value: string;
  frame: number;
  startFrame: number;
  fps: number;
}) {
  const { opacity, scale } = useAppear(frame, startFrame, fps);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        opacity,
        transform: `scale(${scale}) translateY(${(1 - scale) * 10}px)`,
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.5)",
          fontWeight: 500,
          letterSpacing: 0.3,
          fontFamily: FONT_FAMILY,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 14,
          color: "#ffffff",
          fontWeight: 600,
          fontFamily: FONT_FAMILY,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ForecastDay({
  day,
  icon,
  temp,
  frame,
  startFrame,
  fps,
}: {
  day: string;
  icon: string;
  temp: string;
  frame: number;
  startFrame: number;
  fps: number;
}) {
  const { opacity, scale } = useAppear(frame, startFrame, fps);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.5)",
          fontWeight: 500,
          fontFamily: FONT_FAMILY,
        }}
      >
        {day}
      </span>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span
        style={{
          fontSize: 12,
          color: "#ffffff",
          fontWeight: 600,
          fontFamily: FONT_FAMILY,
        }}
      >
        {temp}
      </span>
    </div>
  );
}

export const WeatherCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entrance
  const cardScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 20, mass: 0.8, stiffness: 80 },
  });

  // Slow 3D rotation
  const rotateY = interpolate(frame, [0, 150, 300], [4, -4, 4], {
    extrapolate: "clamp",
  });
  const rotateX = interpolate(frame, [0, 200, 300], [1.5, -1.5, 1.5], {
    extrapolate: "clamp",
  });
  const floatY = interpolate(Math.sin(frame * 0.025), [-1, 1], [-6, 6]);
  const glowOpacity = interpolate(Math.sin(frame * 0.02), [-1, 1], [0.15, 0.35]);

  // Background orbs pulse
  const orb1Size = interpolate(Math.sin(frame * 0.015), [-1, 1], [300, 380]);
  const orb2Size = interpolate(Math.sin(frame * 0.018 + 1), [-1, 1], [250, 320]);

  // --- DATA TIMELINE ---
  const ICON_START = 25;
  const TEMP_START = 38;
  const FEELS_START = 48;
  const LOCATION_START = 56;
  const ROW_1 = 68;
  const ROW_2 = 78;
  const ROW_3 = 88;
  const ROW_4 = 98;
  const FORECAST_START = 112;

  const iconAppear = useAppear(frame, ICON_START, fps, true);
  const tempAppear = useAppear(frame, TEMP_START, fps);
  const feelsAppear = useAppear(frame, FEELS_START, fps);
  const locationAppear = useAppear(frame, LOCATION_START, fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0d0d" }}>
      {/* Background gradient orbs */}
      <div
        style={{
          position: "absolute",
          width: orb1Size,
          height: orb1Size,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(242,81,27,0.12) 0%, transparent 70%)",
          top: "18%",
          left: "28%",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: orb2Size,
          height: orb2Size,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,140,66,0.08) 0%, transparent 70%)",
          bottom: "22%",
          right: "22%",
          filter: "blur(50px)",
        }}
      />

      {/* Glow behind card */}
      <div
        style={{
          position: "absolute",
          width: 440,
          height: 640,
          borderRadius: 32,
          background:
            "radial-gradient(ellipse, rgba(242,81,27,0.25) 0%, transparent 60%)",
          filter: "blur(40px)",
          opacity: glowOpacity,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Weather card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${cardScale}) perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateY(${floatY}px)`,
          transformStyle: "preserve-3d",
          filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5))",
          borderRadius: 28,
          overflow: "hidden",
          width: 380,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.06) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          padding: 0,
        }}
      >
        {/* Inner content */}
        <div style={{ padding: "32px 28px 28px" }}>
          {/* Weather Icon */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 8,
              opacity: iconAppear.opacity,
              transform: `scale(${iconAppear.scale})`,
            }}
          >
            <span style={{ fontSize: 64 }}>☀️</span>
          </div>

          {/* Temperature */}
          <div
            style={{
              textAlign: "center",
              opacity: tempAppear.opacity,
              transform: `scale(${tempAppear.scale})`,
            }}
          >
            <span
              style={{
                fontSize: 64,
                fontWeight: 300,
                color: "#ffffff",
                letterSpacing: -2,
                fontFamily: FONT_FAMILY,
              }}
            >
              26°
            </span>
          </div>

          {/* Feels like */}
          <div
            style={{
              textAlign: "center",
              marginTop: 4,
              opacity: feelsAppear.opacity,
              transform: `translateY(${(1 - feelsAppear.scale) * 8}px)`,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                fontWeight: 500,
                fontFamily: FONT_FAMILY,
              }}
            >
              Sensación térmica 24°
            </span>
          </div>

          {/* Location */}
          <div
            style={{
              textAlign: "center",
              marginTop: 18,
              marginBottom: 24,
              opacity: locationAppear.opacity,
              transform: `scale(${locationAppear.scale})`,
            }}
          >
            <span
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.7)",
                fontWeight: 500,
                letterSpacing: 0.5,
                fontFamily: FONT_FAMILY,
              }}
            >
              📍 Barcelona
            </span>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
              marginBottom: 4,
            }}
          />

          {/* Detail rows */}
          <DetailRow
            label="Viento"
            value="5 km/h"
            frame={frame}
            startFrame={ROW_1}
            fps={fps}
          />
          <DetailRow
            label="Humedad"
            value="67%"
            frame={frame}
            startFrame={ROW_2}
            fps={fps}
          />
          <DetailRow
            label="Precipitaciones"
            value="10%"
            frame={frame}
            startFrame={ROW_3}
            fps={fps}
          />
          <DetailRow
            label="Temp. máxima / mínima"
            value="26° / 18°"
            frame={frame}
            startFrame={ROW_4}
            fps={fps}
          />
        </div>

        {/* 7-day forecast */}
        <div
          style={{
            padding: "18px 20px 20px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <ForecastDay
              day="LUN"
              icon="☀️"
              temp="26°/18°"
              frame={frame}
              startFrame={FORECAST_START}
              fps={fps}
            />
            <ForecastDay
              day="MAR"
              icon="⛅"
              temp="24°/17°"
              frame={frame}
              startFrame={FORECAST_START + 4}
              fps={fps}
            />
            <ForecastDay
              day="MIÉ"
              icon="🌤️"
              temp="25°/18°"
              frame={frame}
              startFrame={FORECAST_START + 8}
              fps={fps}
            />
            <ForecastDay
              day="JUE"
              icon="☀️"
              temp="27°/19°"
              frame={frame}
              startFrame={FORECAST_START + 12}
              fps={fps}
            />
            <ForecastDay
              day="VIE"
              icon="🌧️"
              temp="22°/16°"
              frame={frame}
              startFrame={FORECAST_START + 16}
              fps={fps}
            />
            <ForecastDay
              day="SÁB"
              icon="⛅"
              temp="23°/15°"
              frame={frame}
              startFrame={FORECAST_START + 20}
              fps={fps}
            />
            <ForecastDay
              day="DOM"
              icon="☀️"
              temp="25°/17°"
              frame={frame}
              startFrame={FORECAST_START + 24}
              fps={fps}
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
