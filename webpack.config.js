const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        index: "./spawning-chrome-extension/src/index.tsx",
        background: "./spawning-chrome-extension/src/background.tsx",
        content: "./spawning-chrome-extension/src/content.tsx",
        options: "./spawning-chrome-extension/src/options.tsx",
        popup: "./spawning-chrome-extension/src/popup.tsx",
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
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "manifest.json", to: "../manifest.json" },
                { from: "spawning-chrome-extension/src/assets", to: "../assets" },
                { from: "spawning-chrome-extension/src/App.css", to: "../js/App.css" }, // Add this line to copy the App.css file
            ],
        }),
        ...getHtmlPlugins(["index", "options"]),
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        path: path.join(__dirname, "dist/js"),
        filename: "[name].js",
    },
};

function getHtmlPlugins(chunks) {
    return chunks.map(
        (chunk) =>
            new HTMLPlugin({
                title: "React extension",
                filename: `${chunk}.html`,
                template: path.resolve(__dirname, `./spawning-chrome-extension/src/${chunk}.html`), // specify your HTML file as the template
                chunks: [chunk],
            })
    );
}
