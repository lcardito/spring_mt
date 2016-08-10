(function() {
	"use strict";
	var loginOAuthModule = angular.module("SpectrumOAuthLoginModule", []);

	loginOAuthModule
	.config(['$locationProvider',
		function($locationProvider) {
				$locationProvider.html5Mode({
				enabled: true,
				requireBase: false
			});
		}
	])
	.controller('LoginController', ['$scope', '$location',
		function($scope, $location) {
			$scope.userName = null;
			$scope.password = null;

			$scope.loginError = $location.search().authentication_error;
		}
	]);
})();
