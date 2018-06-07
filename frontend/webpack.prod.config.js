module.exports = {
    mode: "production",
    entry: "./components/entry.ts",
    output: {
        path: __dirname + "./../public/dist/",
        filename: "three_d_repo.min.js"
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