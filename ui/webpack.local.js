const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
    mode: 'development',
    context: path.join(__dirname),
    entry: {
        app: './src/app.tsx',
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/'
    },
    devServer: {
        host: '0.0.0.0',
        port: 8080,
        clientLogLevel: 'error', // set what gets logged in browser console
        // https://github.com/webpack/webpack-dev-server/issues/1604
        historyApiFallback: true,
        inline: true,
        hot: true,
        open: false, // automatically open browser window once build is finished
        overlay: { warnings: false, errors: true },
        publicPath: '/',
        quiet: true, // necessary for FriendlyErrorsPlugin
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
            test: /\.(png|jpg|gif)$/,
            use: 'url-loader?limit=100&[path][name].[contenthash:8].[ext]' // inline base64 URLs for <=8k images, direct URLs for the rest
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
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
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
            template: 'src/index.html',
        }),
        new webpack.EnvironmentPlugin({
          APP_ENV: 'local',
          API_ENDPOINT: 'http://localhost:3000',
          API_HOST: 'http://localhost:3000',
          STRIPE_KEY: 'pk_test_b3zhRE5iSxQs03xLiWoFa925'
        })
      ],
      resolve: {
        modules: ['node_modules', 'src'],
        extensions: ['.js', '.jsx', '.json', '.html', '.ts', '.tsx'],
        alias: {
          '@': path.resolve(__dirname, '../src')
        }
      }
}
