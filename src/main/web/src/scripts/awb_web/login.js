(function() {
	"use strict";
	var mainLoginModule = angular.module("mainLoginModule", ["ui.router",
																"angularUtils.directives.uiBreadcrumbs",
																"spectrumLoginModule",
																"spectrumHeaderModule",
																"spectrumMenuModule",
																"spectrumHeadingModule",
																"spectrumFooterModule",
																"spectrumUtilitiesModule"
															]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration & Initialisation
	///////////////////////////////////////////////////////////////////////////////////////////////////
	mainLoginModule
	.config(["$urlRouterProvider", "$stateProvider", function($urlRouterProvider, $stateProvider) {
		$urlRouterProvider.otherwise("/login");
		$stateProvider
        .state('login', {
            url: '/login',
            templateUrl: "partials/login.html",
            controller: "DashboardController",
            data: {
                displayName: 'Dashboard'
            }
        })
	}])
	.createErrorHandler = spectrumRestangularErrorHandler;

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Controllers
	///////////////////////////////////////////////////////////////////////////////////////////////////
	mainLoginModule
	.controller("DashboardController", ["$scope", "authStateService", "$window",
		function($scope, authStateService, $window) {
			$scope.submit = function() {
			    $scope.loginError = false;
			    authStateService.login($scope.userName, $scope.password)
			    .success(function() {
			        $window.location.href = baseUrl + '/personalised-dashboard.html';
			    })
			    .error(function() {
			        $scope.loginError = true;
			    });
			}
		}
	]);
})();
