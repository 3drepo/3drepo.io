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

        concat: {
            build: {
                src: [
                    'public/plugins/base/*.js',
                    'public/plugins/login/*.js',
                    'public/plugins/account/*.js',
                    'public/plugins/project/*.js',
                    'public/plugins/oculus/*.js',
                    'public/plugins/navigation/*.js',
                    'public/plugins/viewpoints/*.js',
                    'public/plugins/inspect/*.js',
                    'public/plugins/revision/*.js',
                    'public/plugins/panels/*.js',
                    'public/plugins/tree/*.js',
                    'public/plugins/meta/*.js',
                    'public/plugins/issues/*.js',
                    'public/plugins/revisionselector/*.js',
                    'public/plugins/diffselector/*.js',
                    'public/plugins/clip/*.js',
                    'public/plugins/diff/*.js',
                    'public/plugins/view/*.js',
                    'public/plugins/sid/*.js',
                    'public/plugins/walkthrough/*.js',
                    'public/plugins/viewing/*.js'
                ],
                dest: 'public/dist/plugins.concat.js'
            }
        },

        uglify: {
            options: {
                mangle: false
            },
            build: {
                files: {
                    'public/dist/plugins.min.js' : ['public/dist/plugins.concat.js']
                }
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
            src: ['test/**/*.js', 'backend/test/unit/**/*.js']
          },

          integrated: {
            options: {
              reporter: 'spec',
              quiet: false, // Optionally suppress output to standard out (defaults to false)
              clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
            },
            src: ['test/**/*.js', 'backend/test/integrated/**/*.js']
          }
        },

		webfont: {
			icons: {
				src: 'icons/*.svg',
				dest: 'public/css/fonts',
				destCss: 'public/css/external'
			},
			options: {
				font: 'three-d-repo',
				fontFilename: 'three-d-repo',
				htmlDemo: false
			}
		}
    });


	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-webfont');
    grunt.loadNpmTasks('grunt-env');

	grunt.registerTask('default', ['concat', 'uglify', 'webfont']);
	grunt.registerTask('test', ['jshint:backend', 'mochaTest:unit']);
    grunt.registerTask('test-integrated', ['env:test', 'mochaTest:integrated']);
};
