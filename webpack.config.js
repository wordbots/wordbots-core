/* eslint-disable import/order */
const path = require('path');
const webpack = require('webpack');
const merge = require('merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
/* eslint-enable import/order */

let webpackConfig = {
  entry: [
    'babel-polyfill',
    'whatwg-fetch',
    './src/client/index.js'
  ],
  module: {
    rules: [
      { test: /\.(png|jpg|gif|jpeg)$/, loader: 'url-loader?limit=8192'},
      { test: /\.css$/, loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader?sourceMap'}) },
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
    new webpack.IgnorePlugin(/canvas/)
  ],
  resolve: {
    alias: {
      // Disable soundmanager2 console output by using release build.
      soundmanager2: 'soundmanager2/script/soundmanager2-nodebug-jsmin.js'
    }
  }
};

if (process.env.NODE_ENV === 'production') {
  webpackConfig = merge(webpackConfig, {
    devtool: 'source-map',
    entry : [
      'webpack-hot-middleware/client',
      ...webpackConfig.entry
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          include: __dirname
        },
        ...webpackConfig.module.rules
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      }),
      new webpack.optimize.UglifyJsPlugin({sourceMap: true}),
      ...webpackConfig.plugins
    ],
    stats: {
      warnings: false
    }
  });
} else {
  webpackConfig = merge(webpackConfig, {
    devtool: 'inline-source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['es2015', 'stage-2', 'react'],
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
            }
          }
        },
        ...webpackConfig.module.rules
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      ...webpackConfig.plugins
    ]
  });

}

module.exports = webpackConfig;
