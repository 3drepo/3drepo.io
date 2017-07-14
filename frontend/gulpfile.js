const gulp = require("gulp");
const webpack = require('webpack-stream');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const gutil = require('gulp-util');
const order = require("gulp-order");
const print = require('gulp-print');
const livereload = require('gulp-livereload');
const watch = require('gulp-watch');
const cssnano = require('gulp-cssnano');
const path = require('path');
const sourcemaps = require('gulp-sourcemaps');
const merge = require('merge-stream');
const size = require('gulp-size');


const allImages = [
  './images/**'
]

const allFonts = [
  './node_modules/material-design-icons/iconfont/*.{eot,svg,ttf,woff,woff2}',
  './node_modules/font-awesome/fonts/*.{eot,svg,ttf,woff,woff2}'
]
const allCss = [ 
    './css/ui.css',
    './node_modules/angular-material/angular-material.css', 
    './node_modules/font-awesome/css/font-awesome.css',
    './components/**/**.css'
]
const allJs = './components/**/**.js';
const allPug = './components/**/**.pug';
const icons = './icons/*.svg';
const nodeRoot = path.join( __dirname, 'node_modules' )

gulp.task('css', function() {

  return gulp.src(allCss)
         //.pipe(print())
         .pipe(concat("three_d_repo.min.css"))
         .pipe(cssnano())
         .pipe(gulp.dest("./../public/dist/"))
         .pipe(livereload())

});

gulp.task('pug', function(){
  // Eventually this should also compile pug :)
  gulp.src(allPug).pipe(livereload());
})

gulp.task('icons', function () {
  return gulp.src('./icons/*.svg')
    //.pipe(print())
    .pipe(gulp.dest('./../public/icons/'))
    .pipe(livereload())
});

gulp.task('images', function() {
  return gulp.src(allImages).pipe(gulp.dest('./../public/images/'));
});

gulp.task('fonts', function() {
  return gulp.src(allFonts).pipe(gulp.dest('./../public/fonts/'));
});

gulp.task('unity', function() {
  return gulp.src("./unity/**").pipe(gulp.dest('./../public/unity/'));
});


// JavaScript
// We have one dev task and one production task because the time taken to do 
// minifcation + source maps is so long

gulp.task('javascript-dev', function() {

  const dependencies = gulp.src('./entry.js')
        .pipe(sourcemaps.init())
        .pipe(webpack({
          output: {
            filename: 'three_d_repo.dependencies.min.js',
          },
         }, require('webpack')))
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })

  const components = gulp.src(allJs)
        .pipe(order([
          'components/entry/js/entry.js',
          'components/viewer/js/unityUtil.js',
          'components/viewer/js/unitySettings.js',
          'components/viewer/js/viewerUtil.js',
          'components/viewer/js/threed/mapTile.js',
          'components/viewer/js/threed/*.js',
          'components/**/**.js'
        ], { base: './' })) // Required for order to work correctly

  return merge(dependencies, components)
          .pipe(concat("three_d_repo.min.js"))
          .pipe(gulp.dest("./../public/dist/"))
          .pipe(livereload())

});

gulp.task('javascript', function() {

  const dependencies = gulp.src('./entry.js')
        .pipe(sourcemaps.init())
        .pipe(webpack({
          output: {
            filename: 'three_d_repo.dependencies.min.js',
          },
         }, require('webpack')))
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })

  const components = gulp.src(allJs)
        .pipe(order([
          'components/entry/js/entry.js',
          'components/model/js/threed/viewerutil.js',
          'components/model/js/threed/mapTile.js',
          'components/model/js/threed/*.js',
          'components/**/**.js'
        ], { base: './' })) // Required for order to work correctly

  return merge(dependencies, components)
          .pipe(sourcemaps.init())
          .pipe(concat("three_d_repo.min.js"))
          .pipe(uglify({mangle: true})) // Mangle causes error for some reason
            .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
          .pipe(size())
          .pipe(sourcemaps.write('./maps'))
          .pipe(gulp.dest("./../public/dist/"))

});


// Watch for changes and live reload in development
gulp.task('watch', function() {
  livereload.listen({host: 'localhost', port: '35729', start: true })
  gulp.watch("./entry.js", ['javascript-dev']);
  gulp.watch(allJs, ['javascript-dev']);
  gulp.watch(allCss, ['css']);
  gulp.watch(allPug, ['pug']);
  gulp.watch(icons, ['icons']);
  gulp.watch(allImages, ['images']);
});

// Final task to build everything for the frontend (public folder)
// It will use 'javascript' task rather than the dev version which includes maps
gulp.task('build', ['javascript', 'css', 'icons', 'fonts', 'images', 'unity']);

