const gulp = require("gulp");
const webpack = require('webpack-stream');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
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
// const merge = require('merge-stream');


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

gulp.task('dependencies', function() {

  return gulp.src('./entry.js')
        .pipe(sourcemaps.init())
        .pipe(webpack({
          output: {
            filename: 'three_d_repo.dependencies.min.js',
          },
          plugins: [
            new UglifyJSPlugin()
          ]
         }, require('webpack')))
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(gulp.dest("./../public/dist/"))
        .pipe(sourcemaps.write('./../public/dist/'))
        .pipe(livereload())

});

gulp.task('components', function(){
  return gulp.src(allJs)
        .pipe(sourcemaps.init())
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
        .pipe(sourcemaps.write('./../public/dist/'))
        .pipe(gulp.dest("./../public/dist/"))
        .pipe(livereload())
});

// Dependencies and written components
gulp.task('javascript', ['dependencies', 'components']);

gulp.task('css', function() {

  return gulp.src(allCss)
         .pipe(print())
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
  gulp.watch(icons, ['icons']);
  gulp.watch(allImages, ['images']);
});

gulp.task('icons', function () {
  return gulp.src('./icons/*.svg')
    .pipe(print())
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


gulp.task('build', ['javascript', 'css', 'icons', 'fonts', 'images', 'unity']);



// Something like this in the future after we just serve statically:

// return merge(dependencies, threedrepo)
//   .pipe(concat("three_d_repo.min.js"))
//   .pipe(uglify())
//   .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
//   .pipe(gulp.dest("./../public/dist/"))
