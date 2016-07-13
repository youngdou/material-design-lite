'use strict';

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const OUT_PATH = path.resolve('./build');
// Used with webpack-dev-server
const PUBLIC_PATH = '/assets/';
const IS_DEV = process.env.MDL_ENV === 'development';
const IS_PROD = process.env.MDL_ENV === 'production';

module.exports = [{
  name: 'js-components',
  entry: {
    autoInit: [path.resolve('./packages/mdl-auto-init/index.js')],
    BaseComponent: [path.resolve('./packages/mdl-base-component/index.js')],
    Checkbox: [path.resolve('./packages/mdl-checkbox/index.js')],
    Ripple: [path.resolve('./packages/mdl-ripple/index.js')]
  },
  output: {
    path: OUT_PATH,
    publicPath: PUBLIC_PATH,
    filename: 'mdl.[name].' + (IS_PROD ? 'min.' : '') + 'js',
    libraryTarget: 'umd',
    library: ['mdl', '[name]']
  },
  devtool: IS_DEV ? 'source-map' : null,
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  }
}, {
  name: 'js-all',
  entry: path.resolve('./packages/material-design-lite/index.js'),
  output: {
    path: OUT_PATH,
    publicPath: PUBLIC_PATH,
    filename: 'material-design-lite.' + (IS_PROD ? 'min.' : '') + 'js',
    libraryTarget: 'umd',
    library: 'mdl'
  },
  devtool: IS_DEV ? 'source-map' : null,
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
    'material-design-lite': path.resolve('./packages/material-design-lite/index.css'),
    'mdl-animation': path.resolve('./packages/mdl-animation/index.css'),
    'mdl-checkbox': path.resolve('./packages/mdl-checkbox/index.css'),
    'mdl-ripple': path.resolve('./packages/mdl-ripple/index.css')
  },
  output: {
    path: OUT_PATH,
    publicPath: PUBLIC_PATH,
    // In development, these are emitted as js files to facilitate hot module replacement. In
    // all other cases, ExtractTextPlugin is used to generate the final css, so this is given a
    // dummy ".css-entry" extension.
    filename: '[name].' + (IS_PROD ? 'min.' : '') + 'css' + (IS_DEV ? '.js' : '-entry')
  },
  devtool: IS_DEV ? 'source-map' : null,
  module: {
    loaders: [{
      test: /\.css$/,
      loader: IS_DEV ?
          'style!css?sourceMap!postcss' :
          ExtractTextPlugin.extract('css!postcss')
    }]
  },
  plugins: [
    new ExtractTextPlugin('[name].' + (IS_PROD ? 'min.' : '') + 'css')
  ],
  postcss: function() {
    return [
      require('postcss-import')({
        addDependencyTo: webpack
      }),
      require('postcss-cssnext')({
        browsers: 'last 2 versions, Firefox ESR, not ie < 11'
      }),
      require('postcss-discard-comments')(),
      require('postcss-math')
    ];
  }
}];
