var Webpack = require('webpack');
var path = require('path');
var appPath = path.resolve(__dirname, 'src/scripts');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var buildPath = path.resolve(__dirname, 'public', 'build');

var config = {
  context: __dirname,
  //devtool: 'eval-source-map',
  devtool: 'eval-cheap-module-source-map',
  debug: true,
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/dev-server',
    path.resolve(nodeModulesPath, 'babel-core/browser-polyfill.js'),
    path.resolve(appPath, 'main.js')
  ],
  resolve: {
    root: appPath,
    extensions: ['', '.js'],
    modulesDirectories: ['node_modules', 'src']
  },
  output: {
    path: buildPath,
    filename: 'bundle.js',
    publicPath: '/build/'
  },
  module: {
    noParse: [
      /\/babel-core\/browser-polyfill\.js$/
    ],
    preLoaders: [{
      test: /\.js$/,
      loader: 'eslint',
      exclude: [nodeModulesPath]
    }],
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: [nodeModulesPath]
    }, {
      test: /\.css$/,
      loader: 'style!css'
    }, {
      test: /\.(png|jpg)$/,
      loader: 'url-loader?limit=8192'
    }, {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'url-loader?limit=10000&mimetype=application/font-woff'
    }, {
      test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader'
    }]
  },
  plugins: [new Webpack.HotModuleReplacementPlugin()]
};

module.exports = config;
