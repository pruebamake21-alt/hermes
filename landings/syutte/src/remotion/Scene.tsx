import { useRef, useMemo } from "react";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import * as THREE from "three";
import type { Group } from "three";
import helvetiker from "three/examples/fonts/helvetiker_bold.typeface.json";

const SVG_CONTENT = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   width="62.713951mm"
   height="23.118553mm"
   viewBox="0 0 62.713951 23.118553"
   version="1.1"
   id="svg1"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <g id="layer1" transform="translate(-71.637552,-207.4837)">
    <g id="g4">
      <text
         style="font-size:15.1271px;font-family:'Eight One';fill:#ffffff;"
         x="84.432106"
         y="221.36578"
         id="text1-8-8">suytte</text>
      <path
         style="fill:#f2511b;"
         d="m 75.688506,230.58656 c -0.0875,-0.0306 -0.15783,-0.0914 -0.21573,-0.18645 l -0.0551,-0.0905 -9e-5,-5.65265 c -9e-5,-5.06567 -0.005,-5.65861 -0.0402,-5.70995 -0.0221,-0.0315 -0.0635,-0.0698 -0.0921,-0.0851 -0.0719,-0.0385 -0.19807,-0.006 -0.23665,0.0618 -0.0252,0.044 -0.035,1.18745 -0.0451,5.28581 l -0.0129,5.22971 -0.056,0.073 c -0.0308,0.0402 -0.0685,0.0701 -0.084,0.0666 -0.0155,-0.004 -0.0253,0.007 -0.0217,0.0237 0.0113,0.0499 -0.11435,0.0983 -0.25484,0.0987 -0.16134,4.6e-4 -0.28102,-0.0717 -0.36515,-0.22025 l -0.0581,-0.10271 -4.3e-4,-5.20691 -4.4e-4,-5.20691 -0.0635,-0.0635 c -0.0775,-0.0775 -0.16593,-0.081 -0.25595,-0.0101 l -0.0677,0.0533 -0.008,3.84616 -0.008,3.84617 -0.0591,0.0952 c -0.12704,0.20431 -0.42461,0.2575 -0.6175,0.11037 -0.17678,-0.13483 -0.164,0.17956 -0.164,-4.03455 v -3.81866 l -0.0756,-0.0756 c -0.0919,-0.092 -0.15721,-0.0954 -0.25275,-0.0132 l -0.0726,0.0624 -0.0129,2.46608 c -0.01,1.92008 -0.0202,2.47873 -0.0456,2.52323 -0.053,0.0926 -0.20348,0.19223 -0.31254,0.20685 -0.21274,0.0285 -0.41467,-0.10835 -0.46711,-0.31664 -0.0381,-0.15132 -0.0397,-11.29917 -0.003,-11.82031 0.0727,-0.99643 0.37843,-1.8293 0.96173,-2.61968 0.77334,-1.04791 1.99426,-1.75332 3.28047,-1.89535 0.43148,-0.0477 1.11959,-0.0184 1.49953,0.0638 0.93806,0.2029 1.68429,0.5973 2.35021,1.24212 0.4958,0.48011 0.8368,0.97187 1.10421,1.5924 0.1508,0.35 0.21708,0.57339 0.32995,1.11228 l 0.0569,0.2716 v 6.05288 6.05288 l -0.0575,0.0807 c -0.18835,0.26405 -0.57386,0.2423 -0.72358,-0.0408 l -0.0596,-0.11264 v -2.4286 -2.42861 l -0.0635,-0.0635 c -0.0777,-0.0776 -0.16594,-0.081 -0.25636,-0.01 l -0.0681,0.0536 v 3.82237 3.82237 l -0.0594,0.11223 c -0.0326,0.0618 -0.075,0.11745 -0.0942,0.12382 -0.0229,0.008 -0.0278,2.3e-4 -0.0143,-0.0216 0.0135,-0.0219 0.01,-0.0269 -0.01,-0.0145 -0.0167,0.0103 -0.0234,0.0298 -0.0152,0.0433 0.0267,0.0432 -0.17262,0.10753 -0.29149,0.0941 -0.13537,-0.0152 -0.28399,-0.12278 -0.33351,-0.2413 -0.0303,-0.0725 -0.0361,-0.69455 -0.0361,-3.87911 0,-3.51786 -0.004,-3.79821 -0.0438,-3.867 -0.0728,-0.12326 -0.25825,-0.13247 -0.32484,-0.0161 -0.0254,0.0444 -0.0351,1.1732 -0.0452,5.29516 l -0.0129,5.2387 -0.0601,0.0764 c -0.0993,0.12625 -0.18412,0.16771 -0.34342,0.1679 -0.11899,9e-5 -0.16339,-0.0132 -0.24835,-0.0748 -0.20561,-0.14895 -0.18882,0.33901 -0.18882,-5.48509 v -5.19687 l -0.0681,-0.0536 c -0.0849,-0.0669 -0.16674,-0.0682 -0.24584,-0.005 l -0.061,0.0495 -0.0129,5.70151 -0.0129,5.70151 -0.0745,0.0977 c -0.0954,0.12517 -0.22252,0.17894 -0.38578,0.16326 -0.15545,-0.0149 -0.24674,-0.0792 -0.32214,-0.22675 l -0.0583,-0.1139 v -5.64363 c 0,-5.33683 -0.003,-5.64656 -0.0453,-5.69812 -0.0734,-0.0883 -0.19141,-0.097 -0.28032,-0.0205 l -0.0754,0.0648 -0.006,5.66066 c -0.006,6.2528 0.006,5.77762 -0.16634,5.90549 -0.0807,0.0597 -0.3007,0.0918 -0.39715,0.058 z"
         id="path3-9-9" />
    </g>
  </g>
</svg>`;

const FONT = new FontLoader().parse(helvetiker);

// SVG viewBox coordinates (transform = translate(-71.637552, -207.4837))
const TEXT_VIEWBOX_X = 84.432106 - 71.637552; // ≈ 12.79
const TEXT_VIEWBOX_Y = 221.36578 - 207.4837; // ≈ 13.88
const TEXT_FONT_SIZE = 15.1271;
// Path visual center in viewBox (estimated from path bounds)
const PATH_CENTER_X = 4.05;
const PATH_CENTER_Y = 20.5;

export const Scene: React.FC = () => {
  const groupRef = useRef<Group>(null);

  const { swooshGeometry, scale, pathSize } = useMemo(() => {
    const loader = new SVGLoader();
    const data = loader.parse(SVG_CONTENT);

    const shapes: THREE.Shape[] = [];
    data.paths.forEach((path) => {
      const pathShapes = path.toShapes(true);
      pathShapes.forEach((s) => shapes.push(s));
    });

    if (shapes.length === 0) return { swooshGeometry: null, scale: 1, pathSize: new THREE.Vector3() };

    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.04,
      bevelSegments: 4,
    });
    geo.computeVertexNormals();

    const box = new THREE.Box3().setFromObject(new THREE.Mesh(geo));
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = 4 / maxDim;

    const matrix = new THREE.Matrix4().makeScale(s, s, s);
    geo.applyMatrix4(matrix);
    geo.center();

    return { swooshGeometry: geo, scale: s, pathSize: size };
  }, []);

  const textGeometry = useMemo(() => {
    if (!scale) return null;

    // Text size proportional to SVG font-size scaled to 3D space
    const textSize = TEXT_FONT_SIZE * scale;

    const geo = new TextGeometry("suytte", {
      font: FONT,
      size: textSize,
      height: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.015,
      bevelSegments: 4,
    });
    geo.computeVertexNormals();
    geo.center();

    return geo;
  }, [scale]);

  const textPosition = useMemo(() => {
    if (!scale) return [0, 0, 0] as const;

    // Relative offset in viewBox: text center - path center
    const dx = TEXT_VIEWBOX_X - PATH_CENTER_X; // ≈ 8.74
    const dy = TEXT_VIEWBOX_Y - PATH_CENTER_Y; // ≈ -6.62

    // Scale to 3D and invert Y
    const sx = dx * scale;
    const sy = (-dy) * scale;

    return [sx, sy, 0] as const;
  }, [scale]);

  if (!swooshGeometry || !textGeometry) return null;

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-3, -2, 4]} intensity={0.5} />
      <pointLight position={[0, 0, 6]} intensity={0.3} />

      <mesh geometry={swooshGeometry} position={[0, 0, 0]} castShadow>
        <meshPhysicalMaterial
          color="#f2511b"
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      <mesh geometry={textGeometry} position={textPosition} castShadow>
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
};
