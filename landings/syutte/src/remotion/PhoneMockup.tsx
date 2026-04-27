import React from "react";
import { Img } from "remotion";
import { COLORS } from "./theme";

export type PhoneVariant = "white" | "black" | "gold" | "purple";

interface PhoneMockupProps {
  variant?: PhoneVariant;
  screenWidth?: number;
  screenSrc?: string;
}

const BEZEL_COLORS: Record<PhoneVariant, string> = {
  white: "#e8e8ed",
  black: "#1c1c1e",
  gold: "#f0e6d3",
  purple: "#d4d0dd",
};

const BEZEL_BORDER_COLORS: Record<PhoneVariant, string> = {
  white: "#c8c8cc",
  black: "#000000",
  gold: "#d4c5a9",
  purple: "#b8b0c4",
};

const SCREEN_RATIO = 852 / 393;

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  variant = "black",
  screenWidth = 300,
  screenSrc,
}) => {
  const bezelColor = BEZEL_COLORS[variant];
  const borderColor = BEZEL_BORDER_COLORS[variant];
  const screenHeight = Math.round(screenWidth * SCREEN_RATIO);
  const bezelRadius = screenWidth * 0.14;
  const screenRadius = screenWidth * 0.115;
  const borderWidth = screenWidth * 0.012;
  const bezelPadding = screenWidth * 0.035;

  const totalWidth = screenWidth + bezelPadding * 2;
  const totalHeight = screenHeight + bezelPadding * 2;

  const dynamicIslandWidth = screenWidth * 0.35;
  const dynamicIslandHeight = screenWidth * 0.022;
  const dynamicIslandY = screenHeight * 0.025;

  const buttonWidth = screenWidth * 0.018;
  const buttonRadius = buttonWidth / 2;
  const volumeTopY = totalHeight * 0.25;
  const volumeBottomY = totalHeight * 0.35;
  const powerY = totalHeight * 0.3;
  const buttonHeight = screenHeight * 0.07;

  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id="screen-clip">
          <rect
            x={bezelPadding}
            y={bezelPadding}
            width={screenWidth}
            height={screenHeight}
            rx={screenRadius}
          />
        </clipPath>
      </defs>

      {/* Left buttons (volume) */}
      <rect
        x={0}
        y={volumeTopY}
        width={buttonWidth}
        height={buttonHeight}
        rx={buttonRadius}
        fill={borderColor}
      />
      <rect
        x={0}
        y={volumeBottomY}
        width={buttonWidth}
        height={buttonHeight}
        rx={buttonRadius}
        fill={borderColor}
      />

      {/* Right button (power) */}
      <rect
        x={totalWidth - buttonWidth}
        y={powerY}
        width={buttonWidth}
        height={buttonHeight}
        rx={buttonRadius}
        fill={borderColor}
      />

      {/* Phone bezel */}
      <rect
        x={0}
        y={0}
        width={totalWidth}
        height={totalHeight}
        rx={bezelRadius}
        fill={bezelColor}
        stroke={borderColor}
        strokeWidth={borderWidth}
      />

      {/* Screen background */}
      <rect
        x={bezelPadding}
        y={bezelPadding}
        width={screenWidth}
        height={screenHeight}
        rx={screenRadius}
        fill="#000000"
      />

      {/* Screen image */}
      {screenSrc && (
        <g clipPath="url(#screen-clip)">
          <image
            href={screenSrc}
            x={bezelPadding}
            y={bezelPadding}
            width={screenWidth}
            height={screenHeight}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      )}

      {/* Dynamic Island */}
      <rect
        x={(totalWidth - dynamicIslandWidth) / 2}
        y={bezelPadding + dynamicIslandY}
        width={dynamicIslandWidth}
        height={dynamicIslandHeight}
        rx={dynamicIslandHeight / 2}
        fill="#000000"
      />
    </svg>
  );
};
