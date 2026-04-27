import React from "react";
import {
  useCurrentFrame,
  interpolate,
  spring,
  staticFile,
  AbsoluteFill,
  Img,
} from "remotion";
import { COLORS, FONT_FAMILY } from "./theme";

// ── Exact theme colors from globals.css dark ──
const BG = "#0d0d0d";
const CARD_BG = "#292929";
const CARD_BORDER = "#525252";
const INPUT_BG = "#1a1a1a";
const INPUT_BORDER = "#525252";
const MUTED = "#a6a6a6";
const PRIMARY = "#f25a22";
const BUTTON_TEXT = "#1a1a1a";
const WHITE = "#ffffff";

const EMAIL = "admin@suytte.com";
const PASSWORD = "••••••••";

// ── Layout constants ──
const CARD_W = 448;
const CARD_X = (1920 - CARD_W) / 2;
const PAD = 24;
const IX = CARD_X + PAD; // inner content left
const IW = CARD_W - PAD * 2; // inner content width
const CX = 960; // center x

// Approximate card top (visually centered in 1920×900)
const CT = 165;

// Field Y positions — measured from the card top
// So absolute y = CT + relative Y
const R = {
  logo: 24,
  title: 118,
  desc: 148,
  btnRow: 185,
  divider: 235,
  emailLabel: 260,
  emailInput: 282,
  passLabel: 340,
  passInput: 362,
  signIn: 420,
  footer: 478,
};
// Card bottom estimate: footer(478) + 24(pad) + 24 = ~526 from card top
// Card total: ~526px → absolute bottom: 165 + 526 = 691
// Centered in 900: (900-526)/2 = 187... close enough to 165

const EMAIL_CURSOR = { x: IX + 20, y: CT + R.emailInput + 20 };
const PASS_CURSOR = { x: IX + 20, y: CT + R.passInput + 20 };
const BTN_CURSOR = { x: IX + IW / 2, y: CT + R.signIn + 20 };

const CURSOR_PHASES = [
  { f: 0, x: 520, y: 340 },
  { f: 22, x: 520, y: 340 },
  { f: 28, x: EMAIL_CURSOR.x, y: EMAIL_CURSOR.y },
  { f: 129, x: EMAIL_CURSOR.x, y: EMAIL_CURSOR.y },
  { f: 138, x: PASS_CURSOR.x, y: PASS_CURSOR.y },
  { f: 225, x: PASS_CURSOR.x, y: PASS_CURSOR.y },
  { f: 235, x: BTN_CURSOR.x, y: BTN_CURSOR.y },
];

const CLICK_FRAMES = [
  { start: 28, end: 30, x: EMAIL_CURSOR.x, y: EMAIL_CURSOR.y },
  { start: 138, end: 140, x: PASS_CURSOR.x, y: PASS_CURSOR.y },
  { start: 235, end: 237, x: BTN_CURSOR.x, y: BTN_CURSOR.y },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getCursorPos(frame: number): { x: number; y: number } | null {
  if (frame < 22 || frame > 245) return null;
  for (let i = 0; i < CURSOR_PHASES.length - 1; i++) {
    const a = CURSOR_PHASES[i];
    const b = CURSOR_PHASES[i + 1];
    if (frame >= a.f && frame < b.f) {
      const t = b.f - a.f > 0 ? (frame - a.f) / (b.f - a.f) : 1;
      return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
    }
  }
  return null;
}

function getClick(frame: number): { x: number; y: number } | null {
  for (const c of CLICK_FRAMES) {
    if (frame >= c.start && frame < c.end) return { x: c.x, y: c.y };
  }
  return null;
}

const CURSOR_PATH = "M2 2V18L6 14L10 20L12 19L8 13L18 13Z";

const ClickRipple: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div
    style={{
      position: "absolute",
      left: x - 4,
      top: y - 4,
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: "rgba(242, 90, 34, 0.6)",
      boxShadow: "0 0 0 4px rgba(242, 90, 34, 0.2)",
    }}
  />
);

// Helper: field label
const Label: React.FC<{ text: string; y: number }> = ({ text, y }) => (
  <div
    style={{
      position: "absolute",
      left: IX,
      top: CT + y,
      fontFamily: FONT_FAMILY,
      fontSize: 14,
      fontWeight: 500,
      color: WHITE,
    }}
  >
    {text}
  </div>
);

// Helper: input field background
const InputBg: React.FC<{
  y: number;
  focused: boolean;
}> = ({ y, focused }) => (
  <div
    style={{
      position: "absolute",
      left: IX,
      top: CT + y,
      width: IW,
      height: 40,
      borderRadius: 14,
      backgroundColor: INPUT_BG,
      border: focused ? `2px solid ${PRIMARY}` : `1px solid ${INPUT_BORDER}`,
      boxShadow: focused ? `0 0 0 3px rgba(242,90,34,0.15)` : "none",
      transition: "none",
    }}
  />
);

// Helper: typing text in input
const TypingText: React.FC<{
  text: string;
  startFrame: number;
  frame: number;
  y: number;
  charDelay: number;
  color: string;
}> = ({ text, startFrame, frame, y, charDelay, color }) => {
  const elapsed = frame - startFrame;
  const count = Math.min(text.length, Math.max(0, Math.floor(elapsed / charDelay)));
  const opacity = interpolate(elapsed, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: IX + 12,
        top: CT + y + 10,
        fontFamily: FONT_FAMILY,
        fontSize: 14,
        fontWeight: 400,
        color,
        opacity,
        letterSpacing: 0.3,
      }}
    >
      {text.slice(0, count)}
    </div>
  );
};

// Helper: cursor
const Cursor: React.FC<{
  x: number;
  y: number;
  visible: boolean;
}> = ({ x, y, visible }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: CT + y + 10,
      width: 2,
      height: 20,
      backgroundColor: PRIMARY,
      opacity: visible ? 1 : 0,
      borderRadius: 1,
    }}
  />
);

// ── Component ──
export const LoginSimulation: React.FC = () => {
  const frame = useCurrentFrame();

  // Card entrance
  const cardScale = spring({
    frame,
    fps: 30,
    config: { damping: 20, mass: 0.8, stiffness: 120 },
  });
  const cardOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cursor blink
  const cursorOn = Math.sin(frame * 0.12) > 0;

  // Email typing: starts after click
  const emailDone = Math.max(0, Math.min(16, Math.floor((frame - 32) / 6)));
  const emailTyping = frame >= 32 && frame < 128;
  const emailFocus = frame >= 30 && frame < 135;

  // Password typing: starts after click
  const passDone = Math.max(0, Math.min(8, Math.floor((frame - 142) / 10)));
  const passTyping = frame >= 142 && frame < 222;
  const passFocus = frame >= 140 && frame < 230;

  // Button pulse
  const btnActive = frame >= 240;
  const btnPulse = spring({
    frame: Math.max(0, frame - 240),
    fps: 30,
    config: { damping: 8, mass: 0.6, stiffness: 100 },
  });

  // Success toast
  const toastShow = Math.max(0, Math.min(1, (frame - 260) / 20));
  const toastY = interpolate(frame, [260, 275], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #1a0a00 0%, #0d0d0d 50%, #1a0500 100%)",
      }}
    >
      {/* Card */}
      <div
        style={{
          position: "absolute",
          left: CARD_X,
          top: CT,
          width: CARD_W,
          borderRadius: 12,
          border: `1px solid ${CARD_BORDER}`,
          backgroundColor: CARD_BG,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
          padding: PAD,
          fontFamily: FONT_FAMILY,
        }}
      >
        {/* ── Logo ── */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Img
            src={staticFile("login.svg")}
            style={{ height: 80, display: "inline-block" }}
          />
        </div>

        {/* ── Title ── */}
        <div
          style={{
            textAlign: "center",
            fontSize: 24,
            fontWeight: 600,
            color: WHITE,
            lineHeight: "32px",
            marginBottom: 4,
          }}
        >
          Welcome Back
        </div>

        {/* ── Description ── */}
        <div
          style={{
            textAlign: "center",
            fontSize: 14,
            color: MUTED,
            marginBottom: 24,
          }}
        >
          Sign in to your account
        </div>

        {/* ── OAuth buttons ── */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {/* GitHub */}
          <div
            style={{
              flex: 1,
              height: 40,
              borderRadius: 14,
              border: `1px solid ${INPUT_BORDER}`,
              backgroundColor: INPUT_BG,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 500,
              color: WHITE,
            }}
          >
            <svg width={16} height={16} viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </div>
          {/* Google */}
          <div
            style={{
              flex: 1,
              height: 40,
              borderRadius: 14,
              border: `1px solid ${INPUT_BORDER}`,
              backgroundColor: INPUT_BG,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 500,
              color: WHITE,
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </div>
        </div>

        {/* ── Divider ── */}
        <div
          style={{
            position: "relative",
            marginTop: 24,
            marginBottom: 24,
            height: 1,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                borderTop: `1px solid ${CARD_BORDER}`,
              }}
            />
          </div>
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                backgroundColor: CARD_BG,
                paddingLeft: 8,
                paddingRight: 8,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              or continue with
            </span>
          </div>
        </div>

        {/* ── Email field ── */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: WHITE,
              marginBottom: 6,
            }}
          >
            Email
          </div>
          <div
            style={{
              width: "100%",
              height: 40,
              borderRadius: 14,
              backgroundColor: INPUT_BG,
              border: emailFocus
                ? `2px solid ${PRIMARY}`
                : `1px solid ${INPUT_BORDER}`,
              boxShadow: emailFocus
                ? "0 0 0 3px rgba(242,90,34,0.15)"
                : "none",
              display: "flex",
              alignItems: "center",
              paddingLeft: 12,
              fontSize: 14,
              color: WHITE,
            }}
          >
            {emailTyping || frame >= 135 ? (
              <span>{EMAIL.slice(0, emailDone)}</span>
            ) : (
              <span style={{ color: MUTED }}>you@example.com</span>
            )}
            {emailFocus && !(frame >= 135 && frame < 150) && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 20,
                  backgroundColor: PRIMARY,
                  marginLeft: 1,
                  opacity: frame >= 135 ? (cursorOn ? 1 : 0) : 1,
                }}
              />
            )}
          </div>
        </div>

        {/* ── Password field ── */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: WHITE,
              marginBottom: 6,
            }}
          >
            Password
          </div>
          <div
            style={{
              width: "100%",
              height: 40,
              borderRadius: 14,
              backgroundColor: INPUT_BG,
              border: passFocus
                ? `2px solid ${PRIMARY}`
                : `1px solid ${INPUT_BORDER}`,
              boxShadow: passFocus
                ? "0 0 0 3px rgba(242,90,34,0.15)"
                : "none",
              display: "flex",
              alignItems: "center",
              paddingLeft: 12,
              fontSize: 14,
              color: WHITE,
            }}
          >
            {passTyping || frame >= 235 ? (
              <span>{PASSWORD.slice(0, passDone)}</span>
            ) : (
              <span style={{ color: MUTED }}>••••••••</span>
            )}
            {passFocus && !(frame >= 235 && frame < 240) && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 20,
                  backgroundColor: PRIMARY,
                  marginLeft: 1,
                  opacity: frame >= 235 ? (cursorOn ? 1 : 0) : 1,
                }}
              />
            )}
          </div>
        </div>

        {/* ── Sign In button ── */}
        <button
          style={{
            width: "100%",
            height: 40,
            borderRadius: 14,
            backgroundColor: PRIMARY,
            color: BUTTON_TEXT,
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transform: btnActive ? `scale(${1 + (1 - btnPulse) * 0.02})` : "scale(1)",
            boxShadow: btnActive
              ? `0 0 20px rgba(242,90,34,0.4)`
              : "none",
          }}
        >
          {btnActive && frame >= 250 ? (
            <>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#1a1a1a" />
                <path
                  d="M7 12.5l3 3 7-7"
                  stroke={PRIMARY}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Signed In
            </>
          ) : (
            "Sign In"
          )}
        </button>

        {/* ── Footer ── */}
        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 14,
            color: MUTED,
          }}
        >
          Don&apos;t have an account?{" "}
          <span style={{ color: PRIMARY, textDecoration: "underline" }}>
            Sign up
          </span>
        </div>
      </div>

      {/* ── Mouse cursor ── */}
      {(() => {
        const pos = getCursorPos(frame);
        const click = getClick(frame);
        if (!pos) return null;
        const scale = click ? 0.8 : 1;
        return (
          <>
            {/* Suytte logo next to cursor */}
            <div
              style={{
                position: "absolute",
                left: pos.x + 32,
                top: pos.y - 14,
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: CARD_BG,
                border: `1px solid ${PRIMARY}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                pointerEvents: "none",
              }}
            >
              <Img
                src={staticFile("login.svg")}
                style={{ height: 22, display: "block" }}
              />
            </div>
            {/* Click ripple */}
            {click && <ClickRipple x={click.x} y={click.y} />}
            {/* Cursor arrow */}
            <div
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                width: 24,
                height: 24,
                transform: `scale(${scale})`,
                transformOrigin: "0 0",
                pointerEvents: "none",
              }}
            >
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <path
                  d={CURSOR_PATH}
                  fill="white"
                  stroke="rgba(0,0,0,0.4)"
                  strokeWidth={0.8}
                />
              </svg>
            </div>
          </>
        );
      })()}

      {/* ── Success toast ── */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: CX,
          transform: `translateX(-50%) translateY(${toastY}px)`,
          opacity: toastShow,
          display: "flex",
          alignItems: "center",
          gap: 10,
          backgroundColor: "rgba(34, 197, 94, 0.15)",
          border: "1px solid rgba(34, 197, 94, 0.4)",
          borderRadius: 12,
          padding: "12px 24px",
          fontFamily: FONT_FAMILY,
        }}
      >
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#22c55e" />
          <path
            d="M7 12.5l3 3 7-7"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span style={{ color: "#22c55e", fontSize: 15, fontWeight: 500 }}>
          Inicio de sesión exitoso
        </span>
      </div>
    </AbsoluteFill>
  );
};
