const gulp = require("gulp");
const webpack = require('webpack-stream');
const merge = require('merge-stream');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const gutil = require('gulp-util');
const order = require("gulp-order");
const print = require('gulp-print');


gulp.task('dependencies', function() {

  return gulp.src('./entry.js')
        .pipe(webpack({
          output: {
            filename: 'three_d_repo.dependencies.min.js',
          }
        }, require('webpack')))
        //.pipe(concat("three_d_repo.dependencies.min.js"))
        //.pipe(uglify())
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(gulp.dest("./../public/dist/"))

});

gulp.task('components', function(){
  return gulp.src('./components/**/**.js')
        .pipe(order([
          'components/model/js/threed/viewerutil.js',
          'components/model/js/threed/mapTile.js',
          'components/model/js/threed/*.js',
          'components/**/**.js'
        ], { base: './' }))
        .pipe(print())
        .pipe(concat("three_d_repo.min.js"))
         //.pipe(uglify())
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(gulp.dest("./../public/dist/"))
});

gulp.task('build', ['dependencies', 'components']);

// Something like this in the future after we just serve statically:

// return merge(dependencies, threedrepo)
//   .pipe(concat("three_d_repo.min.js"))
//   .pipe(uglify())
//   .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
//   .pipe(gulp.dest("./../public/dist/"))
