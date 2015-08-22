var path = require('path');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var buildPath = path.resolve(__dirname, 'public', 'build');
var appPath = path.resolve(__dirname, 'src/scripts');

var config = {
  // We change to normal source mapping, if you need them to debug
  //devtool: 'source-map',
  devtool: 'hidden-source-map',
  entry: [
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
    filename: 'bundle.js'
  },
  // TODO - place this module stuff in a common file
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
      loader: 'url-loader?name=/fonts/[name].[ext]&limit=10000&mimetype=application/font-woff'
    }, {
      test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader'
    }]
  }
};

module.exports = config;
