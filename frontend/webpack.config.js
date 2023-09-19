const path = require("path");
const BundleTracker = require('webpack-bundle-tracker');
const Dotenv = require("dotenv-webpack");
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
    mode: 'production',
    // mode: 'development',
    context: path.resolve(__dirname),
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, "static"),
        // filename: "main.js",
        publicPath: "/static/frontend/"
    },
    performance: {
        hints: false
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                exclude: /frontend[/\\]static[/\\]images[/\\]profile_images/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'images/[name].[ext]',
                            publicPath: '/static/',
                        },
                    },
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        fallback: {
            fs: false,
            tls: false,
            net: false
        }
    },
    optimization: {
        minimize: true
    },
    plugins: [
        new BundleTracker({path: __dirname, filename: './webpack-stats.json'}),
        new Dotenv(),
        new NodePolyfillPlugin()
    ],
    stats: {
        errorDetails: true
    },

};
