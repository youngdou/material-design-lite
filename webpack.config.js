'use strict';

const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const OUT_PATH = path.resolve('./build');
// Used with webpack-dev-server
const PUBLIC_PATH = '/assets/';
const IS_MIN = process.argv.indexOf('-p') >= 0;

module.exports = [{
  name: 'js',
  entry: {
    'material-design-lite': path.resolve('./packages/material-design-lite/index.js'),
    // We need to use arrays here - see https://github.com/webpack/webpack/issues/300
    'mdl-auto-init': [path.resolve('./packages/mdl-auto-init/index.js')],
    'mdl-base-component': [path.resolve('./packages/mdl-base-component/index.js')],
    'mdl-checkbox': [path.resolve('./packages/mdl-checkbox/index.js')]
  },
  output: {
    path: OUT_PATH,
    publicPath: PUBLIC_PATH,
    filename: '[name].' + (IS_MIN ? 'min.' : '') + 'js'
  },
  devtool: process.env.DEV ? 'eval-source-map' : null,
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  }
}, {
  name: 'css',
  entry: {
    'material-design-lite': path.resolve(
        './packages/material-design-lite/material-design-lite.scss'),
    'material-design-lite-theme': path.resolve(
        './packages/material-design-lite/material-design-lite-theme.scss'),
    'mdl-animation': path.resolve('./packages/mdl-animation/mdl-animation.scss'),
    'mdl-checkbox': path.resolve('./packages/mdl-checkbox/mdl-checkbox.scss'),
    'mdl-checkbox-theme': path.resolve('./packages/mdl-checkbox/mdl-checkbox-theme.scss')
  },
  output: {
    path: OUT_PATH,
    publicPath: PUBLIC_PATH,
    // Dummy file name for the JS which webpack emits. ExtractTextPlugin is used to generate the
    // final styles.
    filename: '[name].' + (IS_MIN ? 'min.' : '') + 'css-entry'
  },
  devtool: process.env.DEV ? 'eval-source-map' : null,
  module: {
    loaders: [{
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract('css!sass')
    }]
  },
  plugins: [
    new ExtractTextPlugin('[name].' + (IS_MIN ? 'min.' : '') + 'css')
  ],
  sassLoader: {
    includePaths: [path.resolve(__dirname, 'packages')]
  }
}];
