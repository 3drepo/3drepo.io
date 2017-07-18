const gulp = require("gulp");
const eslint = require('gulp-eslint');
const env = require('gulp-env');
const mocha = require('gulp-mocha');

gulp.task('test:integrated', function(){

    const envs = env.set({
        NODE_ENV: 'test',
        NODE_CONFIG_DIR: '../config/'
    });

    gulp.src('./test/integrated/**/*.js')
        .pipe(envs)
        .pipe(mocha({
            reporter: 'spec',
            timeout: 10000
        }))
        .once('error', () => {
            process.exit(1);
        })
        .once('end', () => {
            process.exit();
        })


})

gulp.task('test:unit', function(){

    const envs = env.set({
        NODE_ENV: 'test',
        NODE_CONFIG_DIR: '../config/'
    });

    gulp.src('./test/unit/**/*.js')
        .pipe(mocha({reporter: 'spec'}))
        .once('error', () => {
            process.exit(1);
        })
        .once('end', () => {
            process.exit();
        })

})

gulp.task('test:lint', function(){
    return gulp.src(['./**/*.js','!node_modules/**', "!gulpfile.js" ])
        // eslint() attaches the lint output to the "eslint" property 
        // of the file object so it can be used by other modules. 
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.  
        .pipe(eslint.format())
})


gulp.task("test", ["test:unit", "test:integrated"]);