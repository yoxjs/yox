var webpack = require('webpack');
var env = process.env.WEBPACK_ENV;

var libraryName = 'Yox';

var plugins = [
    new webpack.optimize.DedupePlugin()
];
var outputFilename = '.js';

var envVariables = { };

if (env === 'release') {
    envVariables.__DEV__ = false;
    envVariables.__DEBUG__ = false;
    outputFilename = '.min' + outputFilename;
    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            minimize: true
        })
    );
}
else if (env === 'dev') {
    envVariables.__DEV__ = true;
    envVariables.__DEBUG__ = true;
    plugins.push(
        new webpack.HotModuleReplacementPlugin()
    );
}

module.exports = {

    entry: __dirname + '/src/' + libraryName + '.js',
    output: {
        path: __dirname + '/dist',
        filename: libraryName.toLowerCase() + outputFilename,
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    plugins: ['transform-runtime'],
                    presets: ['es2015', 'stage-0']
                }
            }
        ],
        postLoaders: [
            {
                test: /\.js$/,
                loader: 'es3ify-loader'
            }
        ]
    },

    plugins: plugins,

    devServer: {
        port: 9191,
        hot: true,
        inline: true,
    }
}
