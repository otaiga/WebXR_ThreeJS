const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "src/index.ts"),
  output: {
    filename: "js/threejsBundle.js",
    path: path.resolve("./dist/"),
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      fs: false,
      path: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
      },
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        loader: "source-map-loader",
        enforce: "pre",
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
      {
        test: /\.(glsl|vs|fs)$/,
        loader: "ts-shader-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[hash:base64]", // default
                auto: true, // default
              },
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|env|glb|gltf|stl)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, "public/index.html"),
      inject: true,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public/assets/images"),
          to: path.resolve(__dirname, "dist/assets/images"),
        },
        {
          from: path.resolve(__dirname, "public/assets/models"),
          to: path.resolve(__dirname, "dist/assets/models"),
        },
        // {
        //   from: path.resolve(__dirname, "public/assets/videos"),
        //   to: path.resolve(__dirname, "dist/assets/videos"),
        // },
        {
          from: path.resolve(__dirname, "public/assets/textures"),
          to: path.resolve(__dirname, "dist/assets/textures"),
        },
      ],
    }),
  ],
};
