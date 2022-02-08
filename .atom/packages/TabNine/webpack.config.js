/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires,  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
// @ts-check

const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

/* *@type {import('webpack').Configuration} */
const config = {
  target: "node", // extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/

  entry: {
    main: "./lib/main.ts",
  }, // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, "dist"),
    filename: `[name].js`,
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  node: {
    __dirname: false, // leave the __dirname behavior intact
  },
  devtool: "source-map",
  externals: {
    atom: "atom",
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: [".ts", ".js"],
    alias: {
      semver: path.resolve(__dirname, "node_modules/semver"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
  optimization: {
    minimizer: [new TerserPlugin({ extractComments: false })],
  },
};

module.exports = (env) => {
  return [config];
};
