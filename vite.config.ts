// setup vite and releaseit using - https://gemini.google.com/app/d059a6a4e0ffe125
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import * as glob from "glob";

const root = resolve(__dirname);
const targetFolders = ["dataviz"];

const createEntryMap = () => {
  const entry: Record<string, string> = {};
  targetFolders.forEach((folderName) => {
    const files = glob.sync(
      resolve(root, `src/${folderName}/*.{ts,tsx,js,jsx}`)
    );
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
      formats: ["es", "cjs"],

      // **CHANGE 2: Modify fileName to use only the entryName (e.g., 'DensityGrid')**
      // The entryName here is now just the filename (e.g., 'DensityGrid')
      fileName: (format, entryName) => {
        // Output will be: 'DensityGrid.es.js' and 'DensityGrid.cjs.js'
        return `${entryName}.${format}.js`;
      },
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        // Ensuring Rollup's internal naming follows the new format
        entryFileNames: `[name].[format].js`,
        chunkFileNames: `[name]-[hash].js`,
      },
    },
  },
});
