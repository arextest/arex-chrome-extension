const path=require("path")
const CopyPlugin = require('copy-webpack-plugin');
module.exports={
    entry: {
        'content-scripts': './src/content-scripts.ts',
        background: './src/background.ts',
        'interceptor':'./src/interceptor.ts'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: 'public',
                    to: './'
                },
            ]
        })
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    mode: "production"
}
