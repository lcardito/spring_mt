(function() {
	"use strict";
	var spectrumHeaderModule = angular.module("spectrumHeaderModule", []);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Directives
	///////////////////////////////////////////////////////////////////////////////////////////////////
	spectrumHeaderModule
	.directive("spectrumHeader",
		function() {
			//Defines the entire header construct; header.html uses the *Menu directives
			return {
				restrict: "E",
				templateUrl: "partials/header.html"
			};
		}
	);

	spectrumHeaderModule.controller("HeaderController", ["$scope", "authStateService", function($scope, authStateService) {
	    authStateService.authStatePromise.then(
            function(authState) {
                if (authState.isLoggedIn) {
                    $scope.logoUrl = "personalised-dashboard.html"
                } else {
                    $scope.logoUrl = baseUrl
                }
            }
        );
    }]);

})();
