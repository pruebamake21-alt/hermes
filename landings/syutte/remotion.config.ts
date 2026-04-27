import { Config } from "@remotion/cli/config";
import path from "path";

Config.setVideoImageFormat("png");
Config.setEntryPoint(path.resolve("src/remotion/index.ts"));
