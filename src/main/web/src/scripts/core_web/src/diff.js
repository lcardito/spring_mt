(function() {
	"use strict";
	var diffModule = angular.module("spectrumDiffModule", ["diffParserModule"]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Directives
	///////////////////////////////////////////////////////////////////////////////////////////////////
	diffModule
	.directive("spectrumDiff", ["diffParserService",
		function(diffParserService) {
			//We can't use "&nbsp;" as a literal here because angular will sanitise it (I think). The unicode
			//character seems to work though!
			var NBSP = String.fromCharCode(160);
			var TAB = NBSP + NBSP + NBSP + NBSP;

			var link = function($scope) {
				$scope.$watch("diff", function(newDiff) {
					if (newDiff !== null && newDiff !== undefined) {
						var diffs = diffParserService.parseDiff(newDiff);

						var lines = _.flatten(_.pluck(diffs, "hunks"));

						//Replace all spaces and tab characters with HTML non-breaking spaces.
						lines.forEach(function(line) {
							line.text = line.text.replace(/ /g, NBSP).replace(/\t/g, TAB);
						});

						//Calculate the maximum width needed for the line number column and create a function that
						//will format the numbers using it.
						var lineNumbers = _.pluck(lines, "oldLineNumber").concat(_.pluck(lines, "newLineNumber"));
						var maxLineNumber = _.reduce(lineNumbers,
							function(max, n) {
								return n > max ? n : max;
							},
							0
						);
						var maxLineNumberWidth = maxLineNumber.toString().length;

						$scope.formatLineNumber = function(number) {
							var numberString = number ? number.toString() : "";
							var numberStringLength = numberString.length;
							for (var i = 0; i < maxLineNumberWidth - numberStringLength; i++) {
								numberString = NBSP + numberString;
							}
							return numberString;
						};

						$scope.diffs = diffs;
					}
				});
			};

			return {
				restrict: "E",
				templateUrl: "partials/diff.html",
				scope: {
					diff: "="
				},
				link: link
			};
		}
	]);
})();
