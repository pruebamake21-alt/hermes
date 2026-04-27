import { AbsoluteFill, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Scene } from "./Scene";

export const Logo3D: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 0, 14], fov: 40 }}
        gl={{ antialias: true }}
      >
        <Scene />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
