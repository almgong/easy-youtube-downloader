const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack');

module.exports = function(_env, argv) {
  const isProduction = argv.mode === "production";
  const isDevelopment = !isProduction;

  return {
    mode: isDevelopment ? 'development' : 'production',
    devtool: isDevelopment && "cheap-module-source-map",
    entry: "./src/public/js/index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "public/js/[name].js",
      publicPath: "/"
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: true,
              envName: isProduction ? "production" : "development"
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            'css-loader'
          ]
        },
        {
          test: /\.(png|jpg|gif)$/i,
          use: {
            loader: "url-loader",
            options: {
              limit: 8192,
              name: "public/img/[name].[hash:8].[ext]"
            }
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    plugins: [
      isProduction && new MiniCssExtractPlugin({
        filename: 'public/css/[name].[contenthash:8].chunk.css'
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
      })
    ].filter(Boolean),
    devServer: {
      compress: true,
      historyApiFallback: true,
      open: false,
      port: 9000
    }
  };
};
