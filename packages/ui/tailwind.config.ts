import type { Config } from "tailwindcss";
import uiPreset from "./tailwind-preset.js";

const config: Config = {
  darkMode: ["class"],
  presets: [uiPreset],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
};

export default config;
