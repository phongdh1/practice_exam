import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import zalo from "zmp-vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    zalo({
      app: {
        title: "Practice Exam",
        headerTitle: "Practice Exam",
        headerColor: "#1B4F72",
        textColor: "white",
        statusBar: "normal",
      },
      pages: [{ name: "index", path: "/" }],
    }),
  ],
  root: "./",
  base: "",
  build: {
    outDir: "www",
  },
  server: {
    port: 3003,
  },
});
