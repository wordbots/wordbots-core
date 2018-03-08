const path = require('path');

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { compact } = require('lodash');

const BABEL_LOADER_DEV_OPTIONS = {
  presets: ['env', 'stage-2', 'react'],
  plugins: [
    ['react-transform', {transforms: [
      {
        transform: 'react-transform-hmr',
        imports: ['react'],
        locals:  ['module']
      },
      {
        transform: 'react-transform-catch-errors',
        imports: ['react','redbox-react']
      }
    ]}],
    'transform-decorators-legacy',
    'transform-class-properties'
  ]
};

const { NODE_ENV } = process.env;
const isProduction = NODE_ENV === 'production';

const webpackConfig = {
  devtool: isProduction ? 'source-map' : 'cheap-module-eval-source-map',
  entry: compact([
    !isProduction && 'webpack-hot-middleware/client',
    'babel-polyfill',
    'whatwg-fetch',
    './src/client/index.js'
  ]),
  // mode: isProduction ? 'production' : 'development',  // Webpack 4.0+
  module: {
    rules: [
      {
        test: /\.js$/,
        include: /src/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: isProduction ? {} : BABEL_LOADER_DEV_OPTIONS
        }
      },
      { test: /\.(png|jpg|gif|jpeg)$/, loader: 'url-loader?limit=8192'},
      { test: /\.css$/, loader: ExtractTextPlugin.extract({use: 'css-loader?sourceMap', fallback: 'style-loader'}) },
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
    new ExtractTextPlugin('app.css'),
    new CopyWebpackPlugin([{from: 'static'}]),
    new webpack.IgnorePlugin(/canvas/),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(NODE_ENV) }
    })
  ]),
  'stats': isProduction ? 'minimal' : 'normal'
};

module.exports = webpackConfig;
