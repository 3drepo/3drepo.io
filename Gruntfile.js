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
			allJS: {
				options : {
					sourceMap: true
				},

				src: [
					'frontend/project/js/threed/viewerutil.js',
					'frontend/project/js/threed/*.js',
					'frontend/**/*.js'
				],

				dest: 'public/dist/three_d_repo.js'
			},

			allCSS: {
				src: [
					'frontend/**/*.css'
				],

				dest: 'public/dist/three_d_repo.css'
			}
        },

        uglify: {
            options: {
				sourceMap : true,
				mangle: false
            },

			allJS: {
				files: {
					'public/dist/three_d_repo.min.js': ['public/dist/three_d_repo.js']
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
		},

		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			},
			allCSS: {
				files: {
					'public/dist/three_d_repo.min.css': ['public/dist/three_d_repo.css']
				}
			}
		}
    });


	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-webfont');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-env');

	grunt.registerTask('default', ['concat', 'uglify', 'webfont', 'concat:allJS','concat:allCSS', 'uglify:allJS', 'cssmin:allCSS']);
	grunt.registerTask('test', ['jshint:backend', 'mochaTest:unit']);
	grunt.registerTask('test-integrated', ['env:test', 'mochaTest:integrated']);
	grunt.registerTask('frontend', ['concat:allJS','concat:allCSS', 'uglify:allJS', 'cssmin:allCSS']);
};
