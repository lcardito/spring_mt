(function() {
	"use strict";
	var spectrumHeadingModule = angular.module("spectrumWidgetLoadingModule", []);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Directives
	///////////////////////////////////////////////////////////////////////////////////////////////////
	spectrumHeadingModule
	.directive("spectrumWidgetLoading",
		function() {
			//Defines a heading with a title and a subtitle
			return {
				restrict: "E",
				templateUrl: "partials/widgets/widget-loading.html",
				scope: {
					ready: "=",
					widget: "="
				}
			};
		}
	);
})();
