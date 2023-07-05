const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");

const commonConfig = {
  entry: {
    index: "./spawning-extension/src/views/popup/App.tsx",
    background: "./spawning-extension/src/background.ts",
    content: "./spawning-extension/src/content.ts",
    options: "./spawning-extension/src/views/options/App.tsx",
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              compilerOptions: { noEmit: false },
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        exclude: /node_modules/,
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "[name].js",
  },
};

module.exports = [
  {
    ...commonConfig,
    output: {
      ...commonConfig.output,
      path: path.join(__dirname, "dist/chrome/js"),
    },
    plugins: [
      new Dotenv({
        path: path.resolve(__dirname, ".env"),
        systemvars: true,
      }),
      new CopyPlugin({
        patterns: [
          { from: "manifests/manifest-chrome.json", to: "../manifest.json" },
          { from: "spawning-extension/src/assets", to: "../assets" },
          { from: "spawning-extension/src/App.css", to: "../App.css" },
          {
            from: "spawning-extension/src/App.css",
            to: "../js/App.css",
          },
        ],
      }),
      ...getHtmlPlugins(["index", "options"]),
    ],
  },
  {
    ...commonConfig,
    output: {
      ...commonConfig.output,
      path: path.join(__dirname, "dist/firefox/js"),
    },
    plugins: [
      new Dotenv({
        path: path.resolve(__dirname, ".env"),
        systemvars: true,
      }),
      new CopyPlugin({
        patterns: [
          { from: "manifests/manifest-firefox.json", to: "../manifest.json" },
          { from: "spawning-extension/src/assets", to: "../assets" },
          { from: "spawning-extension/src/App.css", to: "../App.css" },
          {
            from: "node_modules/webextension-polyfill/dist/browser-polyfill.js",
            to: "../",
          },
          {
            from: "spawning-extension/src/App.css",
            to: "../js/App.css",
          },
        ],
      }),
      ...getHtmlPlugins(["index", "options"]),
    ],
  },
];

function getHtmlPlugins(chunks) {
  return chunks.map(
    (chunk) =>
      new HTMLPlugin({
        title: "React extension",
        filename: `${chunk}.html`,
        template: path.resolve(
          __dirname,
          "spawning-extension/src/template.html"
        ),
        chunks: [chunk],
      })
  );
}
