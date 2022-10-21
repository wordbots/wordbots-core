const path = require('path');

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { compact } = require('lodash');

const { NODE_ENV } = process.env;
const isProduction = NODE_ENV === 'production';

const webpackConfig = {
  devtool: isProduction ? 'source-map' : 'cheap-module-eval-source-map',
  entry: compact([
    !isProduction && 'webpack-hot-middleware/client',
    'whatwg-fetch',
    './src/client/index.tsx'
  ]),
  mode: isProduction ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        include: /src/,
        exclude: /node_modules/,
        loader: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              plugins: ['react-hot-loader/babel', '@babel/plugin-syntax-dynamic-import']
            }
          },
          {
            loader: 'awesome-typescript-loader',
            options: {
              module: 'es6',
              silent: true,
              transpileOnly: true
            }
          }
        ]
      },
      {
        test: /\.js$/,
        loader: 'source-map-loader',
        enforce: 'pre'
      },
      { test: /\.(png|jpg|gif|jpeg)$/, loader: 'url-loader?limit=8192' },
      { test: /\.css$/, loader: ['style-loader', 'css-loader'] },
      { test: /\.(eot|svg|ttf|woff|woff2)$/, loader: 'file-loader?name=public/fonts/[name].[ext]' }
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: compact([
    !isProduction && new webpack.HotModuleReplacementPlugin(),
    new webpack.EnvironmentPlugin({ NODE_ENV: 'development', PARSER: null, FIREBASE_DB: null }),
    new CopyWebpackPlugin([{ from: 'static' }]),
    new webpack.IgnorePlugin(/^canvas$/),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),  // Ignore all locale files of moment.js
  ]),
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      // https://github.com/lodash/lodash/issues/3079
      './lodash.min': 'lodash/lodash.js',
    }
  },
  stats: isProduction ? 'minimal' : 'normal',
  target: 'web'
};

export default webpackConfig;
