const gulp = require("gulp");
const gutil = require('gulp-util');
const print = require('gulp-print');
const livereload = require('gulp-livereload');
const watch = require('gulp-watch');
const concat = require('gulp-concat');
const cssnano = require('gulp-cssnano');
const path = require('path');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const typedoc = require("gulp-typedoc");
const exec = require('child_process').exec;

let isWatch = false;

function swallowError (error) {
  // If you want details of the error in the console
  console.log(error.toString())
  this.emit('end')
}

// BUILD COMPONENTS
gulp.task("typedoc", function() {
    return gulp
        .src(["../components/**/*.ts"])
        .pipe(typedoc({
            module: "commonjs",
            target: "es6",
            out: "docs/",
            name: "3D Repo Frontend"
        }))
    ;
});

gulp.task('webpack-build', function (cb) {
  exec('webpack --config ./webpack/webpack.prod.config.js', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
})

gulp.task('webpack-watch', function (cb) {
  exec('webpack --watch --config ./webpack/webpack.dev.config.js', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
})

// Watch for changes and live reload in development
gulp.task('gulp-watch', function() {
  isWatch = true;
  livereload.listen({host: 'localhost', port: '35729', start: true, quiet: false })
  // WATCHERS
  gulp.watch(["./../../public/index.html"], gulp.series(["reload"]))
  gulp.watch(["./../../public/dist/three_d_repo.min.js"], gulp.series(["reload"]))
});

gulp.task("watch", gulp.parallel(["gulp-watch", "webpack-watch"]));

gulp.task('build', gulp.series(
  gulp.parallel(
    'webpack-build'
  ))
);

