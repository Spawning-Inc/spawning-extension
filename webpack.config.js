const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const commonConfig = {
    entry: {
        index: "./spawning-chrome-extension/src/index.tsx",
        background: "./spawning-chrome-extension/src/background.tsx",
        content: "./spawning-chrome-extension/src/content.tsx",
        options: "./spawning-chrome-extension/src/options.tsx",
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
            new CopyPlugin({
                patterns: [
                    { from: "manifest-chrome.json", to: "../manifest.json" },
                    { from: "spawning-chrome-extension/src/assets", to: "../assets" },
                    { from: "spawning-chrome-extension/src/App.css", to: "../App.css" },
                    { from: "spawning-chrome-extension/src/App.css", to: "../js/App.css" },
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
            new CopyPlugin({
                patterns: [
                    { from: "manifest-firefox.json", to: "../manifest.json" },
                    { from: "spawning-chrome-extension/src/assets", to: "../assets" },
                    { from: "spawning-chrome-extension/src/App.css", to: "../App.css" },
                    { from: "node_modules/webextension-polyfill/dist/browser-polyfill.js", to: "../" },
                    { from: "spawning-chrome-extension/src/App.css", to: "../js/App.css" },
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
                template: path.resolve(__dirname, `./spawning-chrome-extension/src/${chunk}.html`),
                chunks: [chunk],
            })
    );
}
