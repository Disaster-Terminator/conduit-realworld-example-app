import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// Lock the project root to this worktree. The shared `node_modules`
// is a symlink and Vite would otherwise resolve the root to the
// symlink target, which then refuses to serve files from this dir.
const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: projectRoot,
  resolve: {
    // Don't follow `node_modules` symlinks when resolving modules.
    preserveSymlinks: true,
  },
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [resolve(projectRoot, "frontend/src/setupTests.js")],
    css: true,
  },
});
