/* eslint-disable import/order */
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
/* eslint-enable import/order */

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

let webpackConfig = {
  entry: [
    'babel-polyfill',
    'whatwg-fetch',
    './src/client/index.js'
  ],
  mode: process.env.NODE_ENV,
  module: {
    rules: [
      {
        test: /\.js$/,
        include: /src/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: process.env.NODE_ENV === 'production' ? {} : BABEL_LOADER_DEV_OPTIONS
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
  plugins: [
    new ExtractTextPlugin('app.css'),
    new CopyWebpackPlugin([{from: 'static'}]),
    new webpack.IgnorePlugin(/canvas/),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV) }
    })
  ]
};

if (process.env.NODE_ENV === 'production') {
  webpackConfig = {
    ...webpackConfig,
    devtool: 'source-map',
    mode: 'production',
    stats: { warnings: false }
  };
} else {
  webpackConfig = {
    ...webpackConfig,
    devtool: 'cheap-module-eval-source-map',
    entry: [
      'webpack-hot-middleware/client',
      ...webpackConfig.entry
    ],
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      ...webpackConfig.plugins
    ]
  };
}

module.exports = webpackConfig;
