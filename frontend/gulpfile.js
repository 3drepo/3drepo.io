const gulp = require("gulp");
const webpack = require('webpack-stream');
// const merge = require('merge-stream');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const gutil = require('gulp-util');
const order = require("gulp-order");
const print = require('gulp-print');
const livereload = require('gulp-livereload');
const watch = require('gulp-watch');
const cssnano = require('gulp-cssnano');
const path = require('path');

const allCss = './components/**/**.css';
const allJs = './components/**/**.js';
const allPug = './components/**/**.pug';
const icons = './icons/*.svg';
const nodeRoot = path.join( __dirname, 'node_modules' )

gulp.task('dependencies', function() {

  return gulp.src('./entry.js')
        .pipe(webpack({
          output: {
            filename: 'three_d_repo.dependencies.min.js',
          }
        }, require('webpack')))
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(gulp.dest("./../public/dist/"))
        .pipe(livereload())

});

gulp.task('components', function(){
  return gulp.src(allJs)
        .pipe(order([
          'components/model/js/threed/viewerutil.js',
          'components/model/js/threed/mapTile.js',
          'components/model/js/threed/*.js',
          'components/**/**.js'
        ], { base: './' })) // Required for order to work correctly
        //.pipe(print()) // If you want nice printing of the order of concat
        .pipe(concat("three_d_repo.min.js"))
         //.pipe(uglify()) // Minify or not
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(gulp.dest("./../public/dist/"))
        .pipe(livereload())
});

// Dependencies and written components
gulp.task('javascript', ['dependencies', 'components']);

gulp.task('css', function() {
  return gulp.src(allCss)
         .pipe(concat("three_d_repo.min.css"))
         .pipe(cssnano())
         .pipe(gulp.dest("./../public/dist/"))
         .pipe(livereload())
});

gulp.task('pug', function(){
  // Eventually this should also compile pug :)
  gulp.src(allPug).pipe(livereload());
})

// Watch for changes and live reload
gulp.task('watch', function() {
  livereload.listen({host: 'localhost', port: '35729', start: true })
  gulp.watch("./entry.js", ['dependencies']);
  gulp.watch(allJs, ['components']);
  gulp.watch(allCss, ['css']);
  gulp.watch(allPug, ['pug']);
  gulp.watch(icons, ['fonts']);
});

gulp.task('build', ['javascript', 'css']);

gulp.task('fonts', function () {
  return gulp.src('./icons/*.svg')
    .pipe(print())
    .pipe(gulp.dest('./../public/icons/'))
    .pipe(livereload())
});


// Something like this in the future after we just serve statically:

// return merge(dependencies, threedrepo)
//   .pipe(concat("three_d_repo.min.js"))
//   .pipe(uglify())
//   .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
//   .pipe(gulp.dest("./../public/dist/"))
