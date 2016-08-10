
// get out jslibs json file
var fs = require('fs');
var jsLibs = JSON.parse(fs.readFileSync('jsLibs.json', 'utf8'));

// define the test
var jsTestLibs = [
	'bower_components/angular-route/angular-route.js',
	'bower_components/angular-mocks/angular-mocks.js',
	'src/scripts/core_web/src/utility.js',
	'src/scripts/core_web/src/account.js',
	'src/scripts/core_web/src/analytics.js',
	'src/scripts/core_web/src/array-table-model.js',
	'src/scripts/core_web/src/comments.js',
	'src/scripts/core_web/src/diff.js',
	'src/scripts/core_web/src/feed-viewer.js',
	'src/scripts/core_web/src/footer.js',
	'src/scripts/core_web/src/groups.js',
	'src/scripts/core_web/src/header.js',
	'src/scripts/core_web/src/heading.js',
	'src/scripts/core_web/src/login.js',
	'src/scripts/core_web/src/menu.js',
	'src/scripts/core_web/src/oauth-login.js',
	'src/scripts/core_web/src/widgets/bookmark.js',
	'src/scripts/core_web/src/widgets/nexusPolicy.js',
	'src/scripts/core_web/src/personalised-dashboard.js',
	'src/scripts/core_web/src/popover.js',
	'src/scripts/core_web/src/projects.js',
	'src/scripts/core_web/src/rest-table-model.js',
	'src/scripts/core_web/src/selector.js',
	'src/scripts/core_web/src/shims.js',
	'src/scripts/core_web/src/spectrum-table.js',
	'src/scripts/core_web/src/spectrum-transform.js',
	'src/scripts/core_web/src/spinner.js',
	'src/scripts/core_web/src/string-manipulation-functions.js',
	'src/scripts/core_web/src/userdirectory-info.js',
	'src/scripts/core_web/src/users.js',
	'src/scripts/core_web/src/widget-comments.js',
	'src/scripts/core_web/src/widget-rest-table-model.js',
	'src/scripts/core_web/src/task-timer-functions.js',
	'src/scripts/core_web/src/xml-util-functions.js',
	'src/scripts/awb_web/*.js',
	'src/scripts/process_manager_web/src/processes.js',
	'src/scripts/*/test/*.js',
	'src/scripts/*/test/responses/*.js'
];

// run the karma module function
module.exports = function(config){
	config.set({

		basePath : '',

		files : jsLibs.concat(jsTestLibs),

		autoWatch : true,

		port: 9055,

		colors: true,

		frameworks: ['jasmine'],

		reporters: ['progress', 'junit'],

		junitReporter: {
      outputDir: 'karma_result', // results will be saved as $outputDir/$browserName.xml
      outputFile: 'karma_tests.xml', // if included, results will be saved as $outputDir/$browserName/$outputFile
      suite: 'karma', // suite will become the package name attribute in xml testsuite element
      useBrowserName: true, // add browser name to report and classes names
      nameFormatter: undefined, // function (browser, result) to customize the name attribute in xml testcase element
      classNameFormatter: undefined, // function (browser, result) to customize the classname attribute in xml testcase element,
      properties: {} // key value pair of properties to add to the <properties> section of the report
    },

		browsers : ['PhantomJS'],

		logLevel: config.LOG_DEBUG,

		plugins : [
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-phantomjs-launcher',
			'karma-jasmine',
			'karma-junit-reporter'
		]
 	});
};
