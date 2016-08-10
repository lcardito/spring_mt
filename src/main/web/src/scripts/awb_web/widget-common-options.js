(function() {
	"use strict";
	var spectrumHeadingModule = angular.module("spectrumWidgetCommonOptionsModule", []);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Directives
	///////////////////////////////////////////////////////////////////////////////////////////////////
	spectrumHeadingModule
	.directive("spectrumWidgetCommonOptions",
		function() {
			//Defines a heading with a title and a subtitle
			return {
				restrict: "E",
				templateUrl: "partials/widgets/widget-common-options.html",
				scope: {
					data: "=",
					widget: "=",
					form: "="
				}
			};
		}
	);
})();
