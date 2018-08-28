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

const allImages = [
  './images/**'
]

const allFonts = [
  './node_modules/material-design-icons/iconfont/*.{eot,svg,ttf,woff,woff2}',
  './node_modules/font-awesome/fonts/*.{eot,svg,ttf,woff,woff2}'
]

const allCss = [ 
    './css/ui.css',
    './css/simplebar.css',
    './node_modules/simplebar/dist/simplebar.css',
    './node_modules/angular-material/angular-material.css',
    './node_modules/font-awesome/css/font-awesome.css',
    './components/**/**.css',
]

const allPug = ['./components/**/**.pug', './../pug/legal/**.pug'];
const icons = './icons/*.svg';

function exitOnError(error) {
  gutil.log(gutil.colors.red('[Error]'), error.toString());
  if (!isWatch) {
    process.exit(1);
  }
}

function swallowError (error) {

  // If you want details of the error in the console
  console.log(error.toString())
  this.emit('end')
}

gulp.task('index', function(done){
    return gulp.src('./index.html')
          .on('error', swallowError)
          .pipe(gulp.dest('./../public/'))
          .pipe(livereload())
          .on("end", done);
})

gulp.task('pug', function(done){

  return gulp.src(allPug)
        // .pipe(print())
        .pipe(rename({dirname: ''}))
        .pipe(pug({ verbose : false }))
        .on('error', swallowError)
        .pipe(gulp.dest("./../public/templates/"))
        .pipe(livereload())
        .on("end", done);
  
});

gulp.task('css', function(done) {

  return gulp.src(allCss)
         //.pipe(print())
         .pipe(concat("three_d_repo.min.css"))
         .pipe(cssnano())
         .on('error', swallowError)
         .pipe(gulp.dest("./../public/dist/"))
         .pipe(livereload())
         .on("end", done);

});

gulp.task('icons', function (done) {
  return gulp.src('./icons/*.svg')
    .on('error', swallowError)
    //.pipe(print())
    .pipe(gulp.dest('./../public/icons/'))
    .pipe(livereload())
    .on("end", done);
});

gulp.task('images', function(done) {
  return gulp.src(allImages)
        .on('error', swallowError)
        .pipe(gulp.dest('./../public/images/'))
        .pipe(livereload())
        .on("end", done);
});

gulp.task('fonts', function(done) {
  return gulp.src(allFonts)
        .on('error', swallowError)
        .pipe(gulp.dest('./../public/fonts/'))
        .pipe(livereload())
        .on("end", done);
});

gulp.task('unity', function(done) {
  return gulp.src("./unity/**")
        .on('error', swallowError)  
        .pipe(gulp.dest('./../public/unity/'))
        .on("end", done);
});

gulp.task('custom', function(done) {
  return gulp.src("./custom/**")
        .on('error', swallowError)  
        .pipe(gulp.dest('./../public/custom/'))
        .on("end", done);
});

gulp.task('manifest-file', function(done) {
  return gulp.src("./manifest.json")
    .on('error', swallowError)
    .pipe(gulp.dest('./../public/'))
    .on("end", done);
});

gulp.task('manifest-icons', function(done) {
  return gulp.src("./manifest-icons/**.png")
    .on('error', swallowError)
    .pipe(gulp.dest('./../public/manifest-icons/'))
    .on("end", done);
});

const sw = function(callback, verbose) {
  var swPrecache = require('sw-precache');
  var serviceWorkerName = "service-worker";
  console.log("Service workers");
  const dir = "../public/";
  swPrecache.write(path.join(dir, `${serviceWorkerName}.js`) , {
    staticFileGlobs: [
      `${dir}/index.html`,
      `${dir}/templates/.{html}`,
      `${dir}/dist/**/*.{js,css}`,
      `${dir}/fonts/**/*.{svg,eot,ttf,woff,woff2}`,
      `${dir}/icons/**/*.{svg}`,
      `${dir}/images/**/*.{png,jpg}`,
      `${dir}/unity/**/*.{js,html,data,mem,css,png,jpg}`,
    ],
    stripPrefix: `${dir}`,
    verbose: verbose,
  }, callback);
}

gulp.task('service-workers', function(callback) {
  sw(callback, true)
});

gulp.task('service-workers-dev', function(callback) {
  sw(callback, false)
});

// BUILD COMPONENTS
gulp.task("typedoc", function() {
    return gulp
        .src(["./components/**/*.ts"])
        .pipe(typedoc({
            module: "commonjs",
            target: "es6",
            out: "docs/",
            name: "3D Repo Frontend"
        }))
    ;
});

gulp.task("reload", function() { 
  return gulp
    .src(["./../public/dist/three_d_repo.min.js"])
    .pipe(livereload())
});


gulp.task('webpack-build', function (cb) {
  exec('webpack --config webpack.prod.config.js', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
})

gulp.task('webpack-watch', function (cb) {
  exec('webpack --watch --config webpack.dev.config.js', function (err, stdout, stderr) {
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
  gulp.watch(["./index.html"], gulp.series(["index", "service-workers-dev"]))
  gulp.watch(["./../public/dist/three_d_repo.min.js"], gulp.series(["reload"]))
  gulp.watch(["./../public/dist/three_d_repo.min.js"], gulp.series(["service-workers-dev"]))
  gulp.watch([allCss], gulp.series(["css", "service-workers-dev"]))
  gulp.watch([allPug], gulp.series(["pug", "service-workers-dev"]))
  gulp.watch([icons], gulp.series(["icons", "service-workers-dev"]))
  gulp.watch(["./manifest.json"], gulp.series(['manifest-file', "service-workers-dev"]))
  gulp.watch(["./manifest-icons/**.png"], gulp.series(['manifest-icons', "service-workers-dev"]))

});

gulp.task("watch", gulp.parallel(["gulp-watch", "webpack-watch"]));

gulp.task('build', gulp.series(
  gulp.parallel(
    'index', 
    'pug',
    'css', 
    'icons', 
    'fonts', 
    'images', 
    'unity', 
    'custom',
    'manifest-icons', 
    'manifest-file',
    'webpack-build'
  ),
  'service-workers'
  )
);

