var path = require('path');
var webpack = require('webpack');

function getEntrySources(sources) {
  if (process.env.NODE_ENV === 'production') {
    return sources;
  } else {
    return sources.concat(['webpack-dev-server/client?http://localhost:3000']);
  }
}

module.exports = {
  devtool: 'eval',
  entry: getEntrySources([
    path.join(__dirname, '/node_modules/babel-core/browser-polyfill.js'),
    './src/scripts/main'
  ]),
  output: {
    path: path.join(__dirname, 'build/src'),
    filename: 'bundle.js',
    publicPath: '/src/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    noParse: [
      /\/babel-core\/browser-polyfill\.js$/
    ],
    preLoaders: [{
      test: /\.jsx?$/,
      loader: 'eslint',
      include: path.join(__dirname, 'src')
    }, {
      test: /\.jsx?$/,
      loaders: ['babel'],
      include: path.join(__dirname, 'node_modules', 'react-colorpickr')
    }],
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['react-hot', 'babel'],
      include: path.join(__dirname, 'src')
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
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
  }
};
