var path=require("path")
const CopyPlugin = require('copy-webpack-plugin');
module.exports={
    // 打包的入口配置 ""打包的路径
    entry: {
        'content-scripts': './src/content-scripts.ts',
        background: './src/background.ts',
        'interceptor':'./src/interceptor.ts'
    },
    // 打包之后存放的位置
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
    // 文件引用不需要后缀名
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    mode: "production"
}
