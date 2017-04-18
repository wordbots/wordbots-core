/* eslint-disable import/order */
const path = require('path');
const webpack = require('webpack');
const merge = require('merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
/* eslint-enable import/order */

let webpackConfig = {
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.NoErrorsPlugin()
  ]
};

if (process.env.NODE_ENV === 'production') {
  webpackConfig = merge(webpackConfig, {
    devtool: 'source-map',
    entry : [
      './src/client/index.js'
    ],
    module: {
      loaders: [{
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: __dirname
      },
      { test: /\.(png|jpg|gif|jpeg)$/, loader: 'url-loader?limit=8192'},
      { test: /\.css$/, loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader?sourceMap'}) }
    ]},
    plugins : [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      }),
      new ExtractTextPlugin('app.css'),
      new webpack.optimize.UglifyJsPlugin({sourceMap: true}),
      new CopyWebpackPlugin([{from: 'static'}]),
      new webpack.IgnorePlugin(/canvas/)
    ],
    stats: {
      warnings: false
    }
  });
} else {
  webpackConfig = merge(webpackConfig, {
    devtool: 'inline-source-map',
    module: {
      rules: [{
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
      { test: /\.(png|jpg|gif|jpeg)$/, loader: 'url-loader?limit=8192'},
      { test: /\.css$/, loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader?sourceMap'}) }
    ]},
    entry: [
      'whatwg-fetch',
      'webpack-hot-middleware/client',
      './src/client/index.js'
    ],
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new ExtractTextPlugin('app.css'),
      new CopyWebpackPlugin([{from: 'static'}]),
      new webpack.IgnorePlugin(/canvas/)
    ]
  });

}

module.exports = webpackConfig;
