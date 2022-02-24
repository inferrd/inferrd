const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  context: path.join(__dirname),
  entry: {
    app: './src/App.tsx',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  optimization: {
    runtimeChunk: false,
    splitChunks: {
      maxInitialRequests: Infinity,
      minSize: 0,
    }
  },
  module: {
    rules: [
      {
        // Use babel to transpile react and es2016
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(scss|css)$/,
        use: [{
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: [
              require('tailwindcss'),
              require('autoprefixer'),
            ]
          }
        }]
      },
      {
        test: /\.(scss|css)$/,
        exclude: /inferrd\.css/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: 'url-loader?limit=8192&[path][name].[contenthash:8].[ext]' // inline base64 URLs for <=8k images, direct URLs for the rest
      },
      // Included a JSON parser for the purpose
      // of the InputJson Editor - we should revisit this
      // if we end up not using it.
      {
        test: /\.json$/,
        exclude: /(node_modules)/,
        use: 'json-loader'
      },
      // Including raw loader to be able to parse
      // Typescript files as a string for autocompletion
      // in Monaco editor
      {
        test: /\.txt$/,
        use: 'raw-loader'
      },
      {
        test: /\.(ttc|otf|woff|woff2|ttf)$/,
        use: 'file-loader?name=public/fonts/[name].[contenthash:8].[ext]'
      },
      // Parses SVGs included in css/scss and loads them as utf8 encoded strings.
      // This is often faster than base64 and base64 is unnecessary for SVGs
      // https://www.npmjs.com/package/svg-url-loader
      {
        test: /\.svg$/,
        issuer: {
          include: /\.(css|scss|html)$/
        },
        use: [{
          loader: 'svg-url-loader',
          options: {}
        }]
      },
      {
        test: /\.svg$/,
        issuer: {
          exclude: /\.(css|scss|html)$/
        },
        use: [{
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: {
                removeViewBox: false
              }
            }
          }
        }],
      },
    ],
  },
  externals: [{
    xmlhttprequest: '{XMLHttpRequest:XMLHttpRequest}'
  }],
  plugins: [
    new HtmlWebpackPlugin({
      inject:true,
      hash: true,
      template: 'src/index.html',
    }),
    new webpack.EnvironmentPlugin({
      APP_ENV: 'production',
      API_ENDPOINT: 'http://localhost:3000',
      API_PORT: '3000',
      API_HOST: 'http://localhost:3000'
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ],
  resolve: {
    modules: ['node_modules', 'src'],
    extensions: ['.js', '.jsx', '.json', '.html', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, '../src')
    }
  }
}