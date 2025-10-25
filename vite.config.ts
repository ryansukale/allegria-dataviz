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
      // Alias will be the path without src/ or extension (e.g., 'dataviz/DensityGrid')
      entry[`${folderName}/${fileName}`] = filePath;
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
      // name is not strictly needed for multiple entries with custom fileName
      // name: 'AllegriaLibrary',

      // CRITICAL: Explicitly define formats to ensure both are built
      formats: ["es", "cjs"],

      // CRITICAL: The fileName function must use the [format] variable
      // The entryName here will be the alias (e.g., 'dataviz/DensityGrid')
      fileName: (format, entryName) => {
        // Output: 'dataviz/DensityGrid.es.js' and 'dataviz/DensityGrid.cjs.js'
        return `${entryName}.${format}.js`;
      },
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      // We rely on lib.fileName for naming, but we MUST ensure this is not overriding it
      output: {
        // Ensure no conflicting naming that prevents format separation.
        // The [format] placeholder is generally handled by the lib.fileName function.
        // We can use entryFileNames to confirm the pathing is based on the entry alias.
        entryFileNames: `[name].[format].js`, // Rollup template for safety
        chunkFileNames: `[name]-[hash].js`,
      },
    },
  },
});
