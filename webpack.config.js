var path = require('path')
var TerserPlugin = require('terser-webpack-plugin')

module.exports = {
    target: 'node',
    node: {
        __dirname: false,
        __filename: false
    },
    resolve: {
        alias: {
            'OCI-sdk': path.resolve(__dirname, 'node_modules/OCI-sdk'),
            Common: path.resolve(__dirname, '_build/Tasks/Common')
        }
    },
    externals: {
        'vsts-task-lib/task': 'require("vsts-task-lib/task")'
    },
    optimization: {
        minimizer: [new TerserPlugin({ cache: true, parallel: true, sourceMap: true })]
    }
}
