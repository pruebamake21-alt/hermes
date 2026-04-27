import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Img,
  staticFile,
} from "remotion";
import { FONT_FAMILY } from "./theme";

const IMG_HEIGHT = 3899;
const VIEWPORT_HEIGHT = 1080;
const MAX_SCROLL = IMG_HEIGHT - VIEWPORT_HEIGHT;

// Section boundaries (in pixels from top of full image)
const SECTIONS = [
  { name: "Hero", y: 0, hold: 20 },
  { name: "Features", y: 780, hold: 20 },
  { name: "Pricing", y: 1780, hold: 25 },
  { name: "CTA", y: 2750, hold: 20 },
  { name: "Footer", y: 3300, hold: 25 },
];

// Total frames: scroll between sections + holds
const SCROLL_FRAMES = 45;
const totalFrames = SECTIONS.reduce((acc, s, i) => {
  if (i === 0) return s.hold;
  return acc + s.hold + SCROLL_FRAMES;
}, 0);

export const WebsiteScroll: React.FC = () => {
  const frame = useCurrentFrame();

  // Calculate current position along the timeline
  let currentFrame = 0;
  let currentY = 0;
  let scrollStartY = 0;

  for (let i = 0; i < SECTIONS.length; i++) {
    const section = SECTIONS[i];

    if (i === 0) {
      // First section: just hold
      if (frame < section.hold) {
        currentY = section.y;
        break;
      }
      currentFrame += section.hold;
      scrollStartY = section.y;
    } else {
      const prevSection = SECTIONS[i - 1];
      scrollStartY = prevSection.y;

      if (frame < currentFrame + SCROLL_FRAMES) {
        // Scrolling to this section
        const progress = (frame - currentFrame) / SCROLL_FRAMES;
        const eased = spring({
          frame: frame - currentFrame,
          fps: 30,
          config: { damping: 30, mass: 0.6, stiffness: 120 },
        });
        currentY = interpolate(
          eased,
          [0, 1],
          [scrollStartY, section.y]
        );
        break;
      }
      currentFrame += SCROLL_FRAMES;

      if (frame < currentFrame + section.hold) {
        currentY = section.y;
        break;
      }
      currentFrame += section.hold;
    }

    // If we've gone through all sections
    if (i === SECTIONS.length - 1) {
      currentY = SECTIONS[SECTIONS.length - 1].y;
    }
  }

  // Ensure we don't go past max scroll
  currentY = Math.min(currentY, MAX_SCROLL);

  // Scroll progress for the indicator
  const scrollProgress = currentY / MAX_SCROLL;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* The scrolling website */}
      <div
        style={{
          position: "absolute",
          top: -currentY,
          left: 0,
          width: 1920,
          height: IMG_HEIGHT,
        }}
      >
        <Img
          src={staticFile("hero-scroll-src-1920.png")}
          style={{ width: 1920, height: IMG_HEIGHT, display: "block" }}
        />
      </div>

      {/* Scroll progress bar */}
      <div
        style={{
          position: "absolute",
          right: 20,
          top: 80,
          width: 3,
          height: VIEWPORT_HEIGHT - 160,
          borderRadius: 2,
          background: "rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: `${scrollProgress * 100}%`,
            borderRadius: 2,
            background: "linear-gradient(180deg, #ff8c42, #f2511b)",
            transition: "height 0.05s linear",
          }}
        />
      </div>

      {/* Navigation dots */}
      <div
        style={{
          position: "absolute",
          right: 30,
          top: 80,
          height: VIEWPORT_HEIGHT - 160,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {SECTIONS.map((s, i) => {
          const sectionProgress = s.y / MAX_SCROLL;
          const isActive =
            currentY >= s.y - 50 && currentY <= s.y + 200;
          return (
            <div
              key={s.name}
              style={{
                width: isActive ? 10 : 6,
                height: isActive ? 10 : 6,
                borderRadius: "50%",
                background: isActive ? "#f2511b" : "rgba(255,255,255,0.3)",
                transition: "all 0.1s ease",
                boxShadow: isActive
                  ? "0 0 10px rgba(242,81,27,0.6)"
                  : "none",
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
