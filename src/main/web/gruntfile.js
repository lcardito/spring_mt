module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');
    var jsLibs = grunt.file.readJSON('jsLibs.json');
    require('load-grunt-tasks')(grunt);

    var httpProxy = require('http-proxy');

    var proxy = httpProxy.createProxyServer({
       target: 'http://localhost:8080/'
     });

    var proxyMiddleware = function(req, res, next) {
       if (req.url.indexOf('rest-with-cookies') != -1) {
         proxy.web(req, res);
       } else {
         next();
       }
    };

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			options: {
				force: true
			},
			build: [
				'<%= pkg.build_location %>/fonts/',
				'<%= pkg.build_location %>/images/',
				'<%= pkg.build_location %>/scripts/',
				'<%= pkg.build_location %>/**/*.html'
			]
		},
		copy: {
			our_images: {
				files: [{
					cwd: 'src/images/',
					src: ['**'],
					dest: '<%= pkg.build_location %>/images/',
					nonull: false,
					expand: true,
					flatten: false,
					filter: 'isFile',
				}]
			},
			our_js: {
				files: [{
					cwd: '<%= pkg.spectrum_scripts %>',
					src: [
						'**/**.js',
						'!**/test/*.js'],
					dest: '<%= pkg.build_location %>/scripts/',
					nonull: false,
					expand: true,
					flatten: true,
					filter: 'isFile',
				}]
			},
			js_libs: {
				files: [{
					src: jsLibs,
					dest: '<%= pkg.build_location %>/scripts/libs',
					nonull: true,
					expand: true,
					flatten: true,
					filter: 'isFile',
				}]
			},
			get_fonts: {
				files: [{
					src: [
						'<%= pkg.bower %>/bootstrap/fonts/**',
						'src/fonts/**',
						'src/iconmoon/**'
					],
					dest: '<%= pkg.build_location %>/fonts/',
					nonull: false,
					expand: true,
					flatten: true,
					filter: 'isFile',
				}]
			},
      get_UiBreadcrumbsTpl: {
        files: [{
          src: [
            '<%= pkg.bower %>/angular-utils-ui-breadcrumbs/uiBreadcrumbs.tpl.html'
          ],
          dest: '<%= pkg.build_location %>/directives/uiBreadcrumbs',
          nonull: false,
          expand: true,
          flatten: true,
          filter: 'isFile',
        }]
      }
		},
		uglify: {
			prod:{
				options:{
					banner: '/*<%= pkg.name %> V<%= pkg.version %> made on <%= grunt.template.today("yyyy-mm-dd") %>*/\r',
					mangle: true,
					beautify: false
				},
				files: {
					'<%= pkg.build_location %>/scripts/spectrum.min.js': [
						'<%= pkg.spectrum_scripts %>/**/*.js',
						'!<%= pkg.spectrum_scripts %>/**/test/*.js',
						'!<%= pkg.spectrum_scripts %>/src/libs/*.js'
					]
	      }
			},
			dev:{
				options:{
					mangle: false,
					beautify: true,
					sourceMap: true,
					sourceMapRoot: 'src/scripts/'
				},
				files: {
					'<%= pkg.build_location %>/scripts/spectrum.min.js': [
						'<%= pkg.spectrum_scripts %>/**/*.js',
						'!<%= pkg.spectrum_scripts %>/**/test/*.js',
						'!<%= pkg.spectrum_scripts %>/src/libs/*.js'
					]
				}
			},
			js_libs:{
				options:{
					banner: '/*<%= pkg.name %> V<%= pkg.version %> made on <%= grunt.template.today("yyyy-mm-dd") %>*/\r',
					mangle: true,
					beautify: false
				},
				files: {
					'<%= pkg.build_location %>/scripts/libs/thirdparty.js': [
						'bower_components/spin.js/jquery.spin.js',
						'bower_components/bower-chosen/chosen.jquery.js'
					]
				}
			}

		},
		concat: {
			options: {
				separator: ';',
			},
			dist: {
				src: jsLibs,
				dest: '<%= pkg.build_location %>/scripts/libs/spectrum-lib.min.js',
			},
		},
		watch: {
      options: {
        livereload: true
      },
			for_less: {
				files: "src/less/**/*.less",
				tasks: ['less:live', 'newer:cssmin']
			},
			scripts: {
				files: ['<%= pkg.spectrum_scripts %>/**/*.js'],
				tasks: ['copy:js_libs', 'uglify:js_libs', 'concat', 'uglify:dev'],
			},
			templates:{
				files: "src/views/**/*.html",
				tasks: ['includes']
			}
		},
		cssmin: {
			target: {
				files: [{
					expand: true,
					cwd: '<%= pkg.build_location %>/css',
					src: ['style.css'],
					dest: '<%= pkg.build_location %>/css',
					ext: '.min.css'
				}]
			}
		},
		less: {
			live: {
				options: {
					strictMath: true,
					sourceMap: true,
					outputSourceFiles: true,
					sourceMapURL: 'style.css.map',
					sourceMapFilename: '<%= pkg.build_location %>/css/style.css.map'
				},
				src: 'src/less/style.less',
				dest: '<%= pkg.build_location %>/css/style.css'
			}
		},
		preprocess: {
			options: {
				context: {
					DEBUG: true
				}
			}
		},
		env: {
			dev: {
				NODE_ENV: 'development',
			},
			build: {
				NODE_ENV: 'production',
			}
		},
		karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true,
        logLevel: 'ERROR'
      }
    },
    jshint: {
      all: ['gruntfile.js', 'src/scripts/**/testUtils.js']
    },
    includes: {
      files: {
        src: ['**/*.html', '!**/includes/*.html'],
        dest: '<%= pkg.build_location %>',
        flatten: false,
        cwd: 'src/views/',
        options: {
          silent: false,
          includeRegexp: /^(\s*)#include\s+"(\S+)"\s*$/
        }
      }
    },
		browserSync: {
		  dev: {
		    bsFiles: {
		      src : [
		        '<%= pkg.build_location %>/partials/**/*.html',
		        '<%= pkg.build_location %>/scripts/**/*.js',
		        '<%= pkg.build_location %>/css/**/*.css',
		        '<%= pkg.build_location %>/*.html'
		      ]
		    },
		    options: {
		      startPath : '/spectrum/login.html',
		      watchTask: true,
		      notify: false,
		      timestamps: true,
		      server: {
		        baseDir: '<%= pkg.build_location %>',
		        routes: {
		            '/front_end/src/scripts': 'src/scripts',
		            '/spectrum': '<%= pkg.build_location %>'
		        },
		        middleware: proxyMiddleware
		      }
		    }
		  }
		}
	});

	grunt.registerTask('default', [
		'build',
		'karma'
	]);

	grunt.registerTask('test', ['karma']);

    grunt.registerTask('build', [
		'clean:build',
		'env:build',
		'preprocess',
		'copy:get_fonts',
		'copy:our_images',
		'copy:get_UiBreadcrumbsTpl',
		'includes',
		'concat',
		'uglify:prod',
		'less:live',
		'cssmin'
  ]);

	grunt.registerTask('dev', [
		'clean:build',
		'env:build',
		'preprocess',
		'copy:get_fonts',
		'copy:our_images',
		'copy:js_libs',
		'copy:get_UiBreadcrumbsTpl',
		'uglify:js_libs',
		'includes',
		'concat',
		'uglify:dev',
		'less:live',
		'cssmin',
		'browserSync',
		'watch'
	]);

	grunt.registerTask('dev-run', [
    'clean:build',
	'env:build',
    'preprocess',
    'copy:get_fonts',
    'copy:our_images',
    'copy:js_libs',
    'copy:get_UiBreadcrumbsTpl',
    'uglify:js_libs',
    'copy:our_js',
    'includes',
    'concat',
    'uglify:dev',
    'less:live',
    'cssmin'
  ]);

	grunt.registerTask('tidy', ['clean:build']);
};
