module.exports = function(grunt) {
    
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        env : {
            options : {
            //Shared Options Hash
            },
            test : {
                NODE_ENV : 'test'
            }
        },

        jshint: {
            files: ['js/core/**/*.js', 'public/plugins/**/*.js', 'services/*.js', 'public/js/*.js'],
            options: {
                bitwise: false,
                curly: true,
                eqeqeq: true,
                forin: true,
                freeze: true,
                futurehostile: true,
                strict: true,
                unused: true,
                varstmt: false,
                strict: false,
                esnext: true,
                expr: true,
                newcap: false,
                // options here to override JSHint defaults
                globals: {
                    console: true,
                    module: true,
                    document: true
                }
            },

            backend:{
                files: { src: [
                    'backend/db/**/*.js',
                    'backend/services/**/*.js',
                    'backend/routes/**/*.js',
                    'backend/libs/**/*.js',
                    'backend/models/**/*.js',
                    'backend/*.js'
                ]},
            }

        },

        mochaTest: {
          unit: {
            options: {
              reporter: 'spec',
              quiet: false, // Optionally suppress output to standard out (defaults to false)
              clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
            },
            src: ['backend/test/unit/**/*.js']
          },

          integrated: {
            options: {
              reporter: 'spec',
              timeout: 10000,
              quiet: false, // Optionally suppress output to standard out (defaults to false)
              clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
            },
            src: ['backend/test/integrated/**/*.js']
          }
        },

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-env');

    grunt.registerTask('default', ['test']);
    grunt.registerTask('test', ['jshint:backend', 'mochaTest:unit']);
    grunt.registerTask('test-integrated', ['env:test', 'mochaTest:integrated']);

};
