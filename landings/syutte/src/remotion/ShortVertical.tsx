import React from "react";
import {
  useCurrentFrame,
  spring,
  interpolate,
  staticFile,
} from "remotion";
import { PhoneMockup } from "./PhoneMockup";
import { COLORS, FONT_FAMILY, FONT_BOLD, FONT_MEDIUM } from "./theme";

const SECTION_DURATIONS = [90, 120, 90, 60, 60]; // frames per section
const TOTAL_DURATION = SECTION_DURATIONS.reduce((a, b) => a + b, 0);

interface SectionInfo {
  startFrame: number;
  endFrame: number;
}

function getSections(): SectionInfo[] {
  let cursor = 0;
  return SECTION_DURATIONS.map((d) => {
    const s = { startFrame: cursor, endFrame: cursor + d };
    cursor += d;
    return s;
  });
}

// ── Section 1: Warm gradient + phone ──
const Section1: React.FC<{ frame: number; section: SectionInfo }> = ({
  frame,
  section,
}) => {
  const localFrame = frame - section.startFrame;
  const progress = localFrame / (section.endFrame - section.startFrame);

  const phoneSpring = spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 14, mass: 0.6, stiffness: 90 },
  });

  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleOpacity = interpolate(localFrame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #1a0a00 0%, #0d0d0d 50%, #1a0500 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_FAMILY,
        opacity,
      }}
    >
      <div
        style={{
          transform: `translateY(${(1 - phoneSpring) * 80}px) scale(${phoneSpring})`,
          opacity: phoneSpring,
        }}
      >
        <PhoneMockup
          variant="black"
          screenWidth={220}
          screenSrc={staticFile("screenshots/landing.png")}
        />
      </div>
      <div
        style={{
          marginTop: 40,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${(1 - titleOpacity) * 20}px)`,
        }}
      >
        <div
          style={{
            color: COLORS.accent,
            fontSize: 14,
            fontWeight: FONT_MEDIUM,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Suytte
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: FONT_BOLD,
            lineHeight: 1.2,
          }}
        >
          <span style={{ color: COLORS.accent }}>AGENTES</span>
          <span style={{ color: COLORS.text }}> de IA</span>
          <br />
          <span style={{ color: COLORS.text }}>para tu negocio</span>
        </div>
      </div>
    </div>
  );
};

// ── Section 2: Feature highlight ──
const Section2: React.FC<{ frame: number; section: SectionInfo }> = ({
  frame,
  section,
}) => {
  const localFrame = frame - section.startFrame;
  const dur = section.endFrame - section.startFrame;

  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const slideOut = interpolate(
    localFrame,
    [dur - 20, dur],
    [0, -30],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const fadeOut = interpolate(
    localFrame,
    [dur - 15, dur],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const features = [
    { icon: "📞", title: "Llamadas automatizadas", desc: "IA que habla con tus clientes 24/7" },
    { icon: "📊", title: "Analíticas en tiempo real", desc: "Métricas de cada conversación" },
    { icon: "🔄", title: "Integración total", desc: "Conecta con tus herramientas actuales" },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_FAMILY,
        opacity: fadeOut,
        transform: `translateX(${slideOut}px)`,
      }}
    >
      <div
        style={{
          color: COLORS.accent,
          fontSize: 13,
          fontWeight: FONT_MEDIUM,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 12,
          opacity,
        }}
      >
        Por qué Suytte
      </div>
      <div
        style={{
          color: "#111111",
          fontSize: 32,
          fontWeight: FONT_BOLD,
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: 40,
          opacity,
          padding: "0 40px",
        }}
      >
        Tu negocio nunca duerme
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, opacity }}>
        {features.map((f, i) => {
          const itemDelay = 10 + i * 12;
          const itemOpacity = interpolate(
            localFrame,
            [itemDelay, itemDelay + 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const itemY = interpolate(
            localFrame,
            [itemDelay, itemDelay + 15],
            [20, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={f.title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: itemOpacity,
                transform: `translateY(${itemY}px)`,
                padding: "0 40px",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f5f5f5",
                  borderRadius: 14,
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </div>
              <div>
                <div
                  style={{
                    color: "#111",
                    fontSize: 16,
                    fontWeight: FONT_BOLD,
                    marginBottom: 2,
                  }}
                >
                  {f.title}
                </div>
                <div style={{ color: "#666", fontSize: 13 }}>{f.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Section 3: Phone + dashboard ──
const Section3: React.FC<{ frame: number; section: SectionInfo }> = ({
  frame,
  section,
}) => {
  const localFrame = frame - section.startFrame;
  const dur = section.endFrame - section.startFrame;

  const phoneSpring = spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 15, mass: 0.6, stiffness: 100 },
  });

  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textOpacity = interpolate(localFrame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(localFrame, [dur - 15, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #0a1628 0%, #0d0d1a 50%, #0a0a0a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_FAMILY,
        opacity: opacity * fadeOut,
      }}
    >
      <div
        style={{
          transform: `translateY(${(1 - phoneSpring) * 60}px) scale(${phoneSpring})`,
          opacity: phoneSpring,
        }}
      >
        <PhoneMockup
          variant="black"
          screenWidth={220}
          screenSrc={staticFile("screenshots/dashboard.png")}
        />
      </div>
      <div
        style={{
          marginTop: 40,
          textAlign: "center",
          opacity: textOpacity,
          padding: "0 40px",
        }}
      >
        <div
          style={{
            color: "#6ea8fe",
            fontSize: 14,
            fontWeight: FONT_MEDIUM,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Dashboard
        </div>
        <div
          style={{
            color: COLORS.text,
            fontSize: 26,
            fontWeight: FONT_BOLD,
            lineHeight: 1.3,
          }}
        >
          Control total desde
          <br />
          tu teléfono
        </div>
      </div>
    </div>
  );
};

// ── Section 4: Analytics highlight ──
const Section4: React.FC<{ frame: number; section: SectionInfo }> = ({
  frame,
  section,
}) => {
  const localFrame = frame - section.startFrame;
  const dur = section.endFrame - section.startFrame;

  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(localFrame, [dur - 15, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const stats = [
    { value: "94%", label: "Satisfacción" },
    { value: "24/7", label: "Disponibilidad" },
    { value: "3s", label: "Respuesta" },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_FAMILY,
        opacity: opacity * fadeOut,
      }}
    >
      <div
        style={{
          color: COLORS.accent,
          fontSize: 13,
          fontWeight: FONT_MEDIUM,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        Resultados
      </div>
      <div
        style={{
          color: "#111111",
          fontSize: 30,
          fontWeight: FONT_BOLD,
          textAlign: "center",
          lineHeight: 1.3,
          marginBottom: 40,
          padding: "0 40px",
        }}
      >
        Resultados que hablan
      </div>
      <div
        style={{
          display: "flex",
          gap: 24,
          justifyContent: "center",
        }}
      >
        {stats.map((s, i) => {
          const delay = 10 + i * 10;
          const itemOpacity = interpolate(
            localFrame,
            [delay, delay + 12],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const scale = interpolate(
            localFrame,
            [delay, delay + 12],
            [0.5, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={s.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity: itemOpacity,
                transform: `scale(${scale})`,
                backgroundColor: "#f8f8f8",
                borderRadius: 20,
                padding: "24px 20px",
                minWidth: 90,
              }}
            >
              <div
                style={{
                  color: COLORS.accent,
                  fontSize: 28,
                  fontWeight: FONT_BOLD,
                }}
              >
                {s.value}
              </div>
              <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Section 5: Final CTA ──
const Section5: React.FC<{ frame: number; section: SectionInfo }> = ({
  frame,
  section,
}) => {
  const localFrame = frame - section.startFrame;

  const opacity = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phoneSpring = spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 14, mass: 0.6, stiffness: 90 },
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #1a0a00 0%, #0d0d0d 50%, #1a0500 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_FAMILY,
        opacity,
      }}
    >
      <div
        style={{
          transform: `translateY(${(1 - phoneSpring) * 60}px) scale(${phoneSpring})`,
          opacity: phoneSpring,
        }}
      >
        <PhoneMockup
          variant="black"
          screenWidth={200}
          screenSrc={staticFile("screenshots/login.png")}
        />
      </div>
      <div
        style={{
          marginTop: 40,
          textAlign: "center",
          opacity,
          padding: "0 40px",
        }}
      >
        <div
          style={{
            color: COLORS.accent,
            fontSize: 14,
            fontWeight: FONT_MEDIUM,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Comienza hoy
        </div>
        <div
          style={{
            color: COLORS.text,
            fontSize: 26,
            fontWeight: FONT_BOLD,
            lineHeight: 1.3,
            marginBottom: 16,
          }}
        >
          Prueba Suytte gratis
        </div>
        <div
          style={{
            color: COLORS.textSecondary,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          sin tarjeta de crédito
        </div>
      </div>
    </div>
  );
};

// ── Main composition ──
export const ShortVertical: React.FC = () => {
  const frame = useCurrentFrame();
  const sections = getSections();

  const currentSectionIdx = sections.findIndex(
    (s) => frame >= s.startFrame && frame < s.endFrame
  );
  const currentSection = sections[currentSectionIdx];

  if (!currentSection) return null;

  switch (currentSectionIdx) {
    case 0:
      return <Section1 frame={frame} section={currentSection} />;
    case 1:
      return <Section2 frame={frame} section={currentSection} />;
    case 2:
      return <Section3 frame={frame} section={currentSection} />;
    case 3:
      return <Section4 frame={frame} section={currentSection} />;
    case 4:
      return <Section5 frame={frame} section={currentSection} />;
    default:
      return null;
  }
};
