import { build, defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: "./client/main.tsx", name: "canonical-specs" },
    outDir: "./static",
    minify: "esbuild",
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
