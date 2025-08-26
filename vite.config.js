import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import terser from "@rollup/plugin-terser";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // Tests don't work since vite migration (2025-08)
    environment: "jsdom",
    globalSetup: ["./tests-resources/setup.js"],
  },
  build: {
    outDir: "build",
    minify: false, // We use terser() manually in the correct output
    lib: {
      entry: resolve(__dirname, "src/QuixePlus.js"),
    },
    rollupOptions: {
      output: [
        {
          format: "umd",
          name: "QuixePlus",
          entryFileNames: "QuixePlus.js",
        },
        {
          format: "umd",
          name: "QuixePlus",
          entryFileNames: "QuixePlus.min.js",
          plugins: [terser()],
        },
      ],
    },
  },
});
