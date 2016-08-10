(function() {
	"use strict";
	var spectrumFooterModule = angular.module("spectrumFooterModule", [
		"restangular"
	]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
    // Configuration & Initialisation
    ///////////////////////////////////////////////////////////////////////////////////////////////////
	spectrumFooterModule
	.config(["RestangularProvider", function(RestangularProvider) {
		RestangularProvider.setBaseUrl(baseUrl + "/rest-with-cookies/api/v1");
	}]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Directives
	///////////////////////////////////////////////////////////////////////////////////////////////////
	spectrumFooterModule
	.directive("spectrumFooter", ["Restangular",
		function(Restangular) {
			var link = function($scope) {
				Restangular.one("version").get().then(
					function(version) {
						$scope.version = version;
					}
				);
			};

			return {
				restrict: "E",
				templateUrl: "partials/footer.html",
				link: link
			};
		}
	]);
})();
