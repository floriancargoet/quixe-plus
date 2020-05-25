import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";

const config = {
  input: "src/QuixePlus.js",
  output: [
    {
      name: "QuixePlus",
      file: "build/QuixePlus.js",
      format: "umd"
    },
    {
      name: "QuixePlus",
      file: "build/QuixePlus.min.js",
      format: "umd",
      plugins: [terser()]
    }
  ],
  plugins: [babel({ babelHelpers: "bundled" })]
};

export default config;
