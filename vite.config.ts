// setup vite and releaseit using - https://gemini.google.com/app/d059a6a4e0ffe125
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import * as glob from "glob";

const root = resolve(__dirname);
const targetFolders = ["dataviz"];
const buildFormat = process.env.BUILD_FORMAT === "cjs" ? "cjs" : "es";

const createEntryMap = () => {
  const entry: Record<string, string> = {};
  targetFolders.forEach((folderName) => {
    const files = glob
      .sync(resolve(root, `src/${folderName}/*.{ts,tsx,js,jsx}`))
      .filter((filePath) => !filePath.endsWith(".test.ts"));
    files.forEach((filePath) => {
      const fileName = filePath.substring(
        filePath.lastIndexOf("/") + 1,
        filePath.lastIndexOf(".")
      );
      // **CHANGE 1: Alias is now just the fileName (e.g., 'DensityGrid')**
      // This maps the source file to the desired output name base.
      entry[fileName] = filePath;
    });
  });
  return entry;
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: createEntryMap(),
      formats: [buildFormat],

      // Keep the format in the filename so Node can distinguish ESM and CJS.
      fileName: (format, entryName) =>
        format === "cjs" ? `${entryName}.cjs` : `${entryName}.mjs`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        chunkFileNames:
          buildFormat === "cjs" ? `[name]-[hash].cjs` : `[name]-[hash].mjs`,
      },
    },
  },
});
