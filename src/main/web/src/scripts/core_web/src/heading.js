(function() {
	"use strict";
	var spectrumHeadingModule = angular.module("spectrumHeadingModule", []);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Directives
	///////////////////////////////////////////////////////////////////////////////////////////////////
	spectrumHeadingModule
	.directive("spectrumHeading",
		function() {
			//Defines a heading with a title and a subtitle
			return {
				restrict: "E",
				templateUrl: "partials/heading.html",
				scope: {
					title: "@",
					subtitle: "@"
				}
			};
		}
	);
})();
