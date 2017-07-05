module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-webfont');
    
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
					'frontend/model/js/threed/viewerutil.js',
					'frontend/model/js/threed/*.js',
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

		webfont: {
			icons: {
				src: 'icons/*.svg',
				dest: 'public/css/fonts',
				destCss: 'public/css/external',
                options: {
				    font: 'three-d-repo',
				    fontFilename: 'three-d-repo',
				    htmlDemo: false
			    }
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
		},

        watch: {
            // Running watch may throw an ENOSPC error see:
            // http://stackoverflow.com/questions/22475849/node-js-error-enospc
            // Fix:
            // echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
            js: {
                files: ['frontend/**/**.js'],
                tasks: ['concat:allJS', 'uglify:allJS']
            },
            css: {
                files: ['frontend/**/**.css'],
                tasks: ['concat:allCSS', 'cssmin:allCSS']
            },
            pug: {
                files: ['frontend/**/**.pug'],
                tasks: ['']
            },
            options: {
                livereload: true
            }

        },

    });


    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-webfont');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['concat', 'uglify', 'webfont', 'concat:allJS','concat:allCSS', 'uglify:allJS', 'cssmin:allCSS']);
    grunt.registerTask('test', ['jshint:backend', 'mochaTest:unit']);
    grunt.registerTask('test-integrated', ['env:test', 'mochaTest:integrated']);
    grunt.registerTask('frontend', ['concat:allJS','concat:allCSS', 'uglify:allJS', 'cssmin:allCSS']);

    grunt.event.on('watch', function(action, filepath, target) {
        grunt.log.writeln('Watch: ' + filepath + ' has ' + action);
    });


};
