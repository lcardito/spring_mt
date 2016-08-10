(function() {
	"use strict";
	var popoverModule = angular.module("spectrumPopoverModule", []);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Directives
	///////////////////////////////////////////////////////////////////////////////////////////////////
	popoverModule
	.directive("spectrumPopover",
		function() {
			var link = function($scope, element, attributes) {
				$(element).popover({
					trigger: "hover",
					html: true,
					content: attributes.popoverText,
					placement: attributes.popoverPlacement
				});
			};

			return {
				restrict: "A",
				link: link
			};
		}
	);
})();
