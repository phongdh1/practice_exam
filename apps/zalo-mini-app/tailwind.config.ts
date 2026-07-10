import type { Config } from "tailwindcss";
import uiPreset from "@practice-exam/ui/tailwind-preset";

const config: Config = {
  presets: [uiPreset],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};

export default config;
