(function() {
	"use strict";
	var userDirectoryModule = angular.module("userDirectoryModule", [
		"ui.router",
		"angularUtils.directives.uiBreadcrumbs",
		"spectrumLoginModule",
		"spectrumHeaderModule",
		"spectrumMenuModule",
		"spectrumHeadingModule",
		"spectrumFooterModule",
		"restangular"
	]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration & Initialisation
	///////////////////////////////////////////////////////////////////////////////////////////////////
	userDirectoryModule
	.config(["$urlRouterProvider", "$stateProvider", "RestangularProvider", function($urlRouterProvider, $stateProvider, RestangularProvider) {
		setupDefaultRestangularUrlModifications(RestangularProvider);

		$urlRouterProvider.otherwise("/userdirectory");
		$stateProvider.state("userdirectory", {
			url: "/userdirectory",
			templateUrl: "partials/userdirectory-list.html",
			controller: "ListController",
			data: {
                displayName: 'User Directory'
            }
		})

	}])
	.createErrorHandler = spectrumRestangularErrorHandler;

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Controllers
	///////////////////////////////////////////////////////////////////////////////////////////////////
	userDirectoryModule
	.controller("ListController", ["$scope", "Restangular",
		function($scope, Restangular) {
			Restangular.one("userdirectory").get().then(
				function(userDirectory) {
					$scope.userDirectory = userDirectory;
				}, userDirectoryModule.createErrorHandler($scope)
			);

			$scope.save = function() {
				Restangular.one("userdirectory").customPUT($scope.userDirectory).then(
					function() {
						$scope.successMsg = "User directory information updated!";
					}, userDirectoryModule.createErrorHandler($scope)
				);
			};
		}
	]);
})();
