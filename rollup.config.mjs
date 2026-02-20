import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { minify } from "html-minifier";
import htmlTemplate from "rollup-plugin-generate-html-template";
import postcss from "rollup-plugin-postcss";
import serve from "rollup-plugin-serve";

const srcDir = "src";
const distDir = "dist";
const extensions = [".js", ".jsx", ".ts", ".tsx"];

export default {
  input: srcDir + "/index.ts",
  output: { dir: distDir, format: "es", sourcemap: true },
  plugins: [
    commonjs({ include: ["node_modules/**"] }), // convert CommonJS modules to ES6
    resolve({ extensions }), // resolve third party modules
    babel({ babelHelpers: "bundled", extensions, targets: "defaults" }), // transpile to ES5
    process.env.ROLLUP_WATCH
      ? serve({ contentBase: "dist" }) // serve
      : terser(), // minify generated ES bundle
    postcss({ extract: true, minimize: true }), // bundle css files
    htmlTemplate({ template: srcDir + "/index.html" }),
    htmlTemplate({ template: srcDir + "/admin.html" }),
    htmlTemplate({ template: srcDir + "/presenter.html" }),
    // minify html files
    {
      closeBundle: async () => {
        const fs = await import("fs");
        fs.readdirSync(distDir)
          .filter((f) => f.endsWith(".html"))
          .map((f) => distDir + "/" + f)
          .forEach((f) => {
            const data = fs.readFileSync(f);
            const min = minify(
              data.toString().replace(/\s*[\r\n]+\s*/gm, " "),
              {
                collapseWhitespace: true,
                conservativeCollapse: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
                minifyCSS: true,
                minifyJS: true,
              }
            );
            fs.writeFileSync(f, min);
          });
      },
    },
  ],
};
