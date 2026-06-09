import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import path from "path";

const projectRoot = new URL(".", import.meta.url).pathname;

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: path.join(projectRoot, "frontend/src/setupTests.js"),
    css: true,
  },
});
