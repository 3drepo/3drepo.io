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
const pug = require('gulp-pug');
const rename = require('gulp-rename');

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
const allJs = ['./components/**/**.js', './bootstrap.js'];
const allPug = ['./components/**/**.pug', './../pug/legal/**.pug'];
const icons = './icons/*.svg';

const jsOrder = [
          'components/entry/js/entry.js',
          'components/viewer/js/globals/unity-util.js',
          'components/viewer/js/globals/unity-settings.js',
          'components/viewer/js/globals/map-tile.js',
          'components/viewer/js/globals/*.js',
          'components/**/**.js',
          'bootstrap.js'
        ];

gulp.task('index', function(){
    return gulp.src('./index.html')
          .pipe(gulp.dest('./../public/'))
          .pipe(livereload())
})

gulp.task('pug', function(){

  return gulp.src(allPug)
        // .pipe(print())
        .pipe(rename({dirname: ''}))
        .pipe(pug({ verbose : false }))
        .pipe(gulp.dest("./../public/templates/"))
        .pipe(livereload())
  
});

gulp.task('css', function() {

  return gulp.src(allCss)
         //.pipe(print())
         .pipe(concat("three_d_repo.min.css"))
         .pipe(cssnano())
         .pipe(gulp.dest("./../public/dist/"))
         .pipe(livereload())

});

gulp.task('icons', function () {
  return gulp.src('./icons/*.svg')
    //.pipe(print())
    .pipe(gulp.dest('./../public/icons/'))
    .pipe(livereload())
});

gulp.task('images', function() {
  return gulp.src(allImages)
        .pipe(gulp.dest('./../public/images/'))
        .pipe(livereload())
});

gulp.task('fonts', function() {
  return gulp.src(allFonts)
        .pipe(gulp.dest('./../public/fonts/'))
        .pipe(livereload())
});

gulp.task('unity', function() {
  return gulp.src("./unity/**").pipe(gulp.dest('./../public/unity/'));
});

gulp.task('manifest-file', function() {
  return gulp.src("./manifest.json")
    .pipe(gulp.dest('./../public/'));
});

gulp.task('manifest-icons', function() {
  return gulp.src("./manifest-icons/**.png")
    .pipe(gulp.dest('./../public/manifest-icons/'));
});

gulp.task('service-workers', function(callback) {

  var swPrecache = require('sw-precache');
  var rootDir = '../public/';
  var serviceWorkerName = "precache";

  swPrecache.write(`${rootDir}/service-workers/${serviceWorkerName}.js`, {
    staticFileGlobs: [
      rootDir + 'index.html',
      rootDir + 'templates/.{html}',
      rootDir + 'dist/**/*.{js,css}',
      rootDir + 'fonts/**/*.{svg,eot,ttf,woff,woff2}',
      rootDir + 'icons/**/*.{svg}',
      rootDir + 'images/**/*.{png,jpg}',
      rootDir + 'unity/**/*.{js,html,data,mem,css,png,jpg}',
    ],
    stripPrexix: rootDir,
    replacePrefix: "/"
  }, callback);

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
        .pipe(order(jsOrder, { base: './' })); // Required for order to work correctly

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
        .pipe(order(jsOrder, { base: './' })); // Required for order to work correctly

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
  gulp.watch("./index.html", ['index']);
  gulp.watch("./components/**/*.pug", ['pug']);
  gulp.watch("./entry.js", ['javascript-dev']);
  gulp.watch(allJs, ['javascript-dev']);
  gulp.watch(allCss, ['css']);
  gulp.watch(allPug, ['pug']);
  gulp.watch(icons, ['icons']);
  gulp.watch(allImages, ['images']);
  gulp.watch("./manifest.json", ['manifest-file']);
  gulp.watch("./manifest-icons/**.png", ['manifest-icons']);
});

// Final task to build everything for the frontend (public folder)
// It will use 'javascript' task rather than the dev version which includes maps
gulp.task('build', ['index', 'pug', 'javascript', 'css', 'icons', 'fonts', 'images', 'unity', 'manifest-icons', 'manifest-file'], function () {
  gulp.start('service-workers');
});

