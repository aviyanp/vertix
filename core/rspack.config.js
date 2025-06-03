// @ts-check
import { defineConfig } from "@rspack/cli";
import { SwcJsMinimizerRspackPlugin } from "@rspack/core";

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  entry: {
    app: "./src/app.js",
  },
  context: import.meta.dirname,
  mode: isProduction ? "production" : "development",
  output: {
    path: "../public/js",
    iife: false
  },
  optimization: {
    minimizer: [
      new SwcJsMinimizerRspackPlugin({
        minimizerOptions: {
          compress: {
            // great default! :D
            drop_debugger: false,
          },
        },
      }),
    ],
  },
  devtool: "source-map",
  target: ["web", "es2022"],
});