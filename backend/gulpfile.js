"use strict";

const gulp = require("gulp");
const eslint = require("gulp-eslint");
const env = require("gulp-env");
const mocha = require("gulp-mocha");
const path = require("path");
const abs = path.resolve;

gulp.task("test:integrated", function(done){

    const envs = env.set({
        NODE_ENV: "test",
        NODE_CONFIG_DIR: "../config/"
    });

    gulp.src(abs("./test/integrated/**/*.js"))
        .pipe(envs)
        .pipe(mocha({
            reporter: "spec",
            exit:true,
            timeout: 10000
        }))
        .once("error", (error) => done)
        .once("_result", () => done());

});

gulp.task("test:unit", function(done){

    env.set({
        NODE_ENV: "test",
        NODE_CONFIG_DIR: "../config/"
    });

    gulp.src(abs("./test/unit/**/*.js"), {read: false})
        .pipe(mocha({reporter: "spec", exit:true}))
        .once("error", done)
        .once("_result", () => done());

});


gulp.task("test:unit-one", function(done){
    if (process.argv.length != 5) {
        console.log("Error: you need to specify a test file");
        process.exit(1);
    }

    env.set({
        NODE_ENV: "test",
        NODE_CONFIG_DIR: "../config/"
    });

    var file = process.argv[4];
    gulp.src(abs("./test/unit/models/" + file), {read: false})
        .pipe(mocha({reporter: "spec", exit:true}))
        .once("error", done)
        .once("_result",() => done());
});




gulp.task("test:lint", function(){
    return gulp.src(["./**/*.js","!node_modules/**", "!gulpfile.js", "!doc/**" ])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        .pipe(eslint.format());
});

gulp.task("test:lint-fix", function(){
    return gulp.src(["./**/*.js","!node_modules/**", "!gulpfile.js", "!doc/**" ])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint({fix:true}))
        // eslint.format() outputs the lint results to the console.
        .pipe(eslint.format());
});

gulp.task("test:integrated-one", function(done) {
    if (process.argv.length === 5) {
        const envs = env.set({
            NODE_ENV: "test",
            NODE_CONFIG_DIR: "../config/"
        });

        const intPath = abs("./test/integrated/" + process.argv[4]);
        console.log("processing " + intPath);

        gulp.src(intPath)
            .pipe(envs)
            .pipe(mocha({
                reporter: "spec",
                timeout: 10000,
                exit:true
            }))
            .once("error", done)
            .once("_result", () => done());
    } else {
        console.log("Must provide one argument; the file name of the intergrated test");
    }
});


gulp.task("test", gulp.series("test:unit", "test:integrated"));
