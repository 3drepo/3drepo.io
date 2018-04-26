module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./globals/unity-util.ts",
    output: {
      path: __dirname + "./../public/unity/",
      filename: "unity-util.js"
    },
    resolve: {
      extensions: [".ts", ".js"]
    },
    module: {
      rules: [
        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
        { test: /\.tsx?$/, loader: "ts-loader" }
      ]
    }
  };