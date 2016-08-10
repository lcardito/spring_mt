(function() {
	"use strict";
	var accountModule = angular.module("accountModule", [
		"ui.router",
		"angularUtils.directives.uiBreadcrumbs",
		"spectrumLoginModule",
		"spectrumHeaderModule",
		"spectrumMenuModule",
		"spectrumHeadingModule",
		"spectrumFooterModule",
		"spectrumTableModule",
		"restangular"
	]);
	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration & Initialisation
	///////////////////////////////////////////////////////////////////////////////////////////////////
	accountModule
	.config(["$urlRouterProvider", "$stateProvider", "RestangularProvider", function($urlRouterProvider, $stateProvider, RestangularProvider) {
		setupDefaultRestangularUrlModifications(RestangularProvider);

		$urlRouterProvider.otherwise("/account");
		$stateProvider.state("account", {
			url: "/account",
			templateUrl: "partials/account.html",
			controller: "AccountController",
			data: {
                displayName: 'Account Details'
            }
		});
	}])
	// We might be able to set a global error handler by using Restangular.setErrorInterceptor(). However, when an error
	// interceptor is called, the $scope isn't, er, in scope. I could come up with a way to bring it into scope but that
	// feels hacky and I don't know enough about Angular/Restangular to be sure I wasn't breaking anything. So we just
	// accept $scope here, close over it and return an error handling function. Then every call just needs to use
	// createErrorHandler($scope). Not as nice as a global error handler but better than duplicate code everywhere.
	.createErrorHandler = spectrumRestangularErrorHandler;

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Controllers
	///////////////////////////////////////////////////////////////////////////////////////////////////
	accountModule
	.controller("AccountController", ["$scope", "Restangular", "authStateService",
		function($scope, Restangular, authStateService) {
			var updateAccountInformation = function() {
				$scope.editMode = false;
				$scope.oldPassword = "";
				$scope.password = "";
				$scope.confirmPassword = "";
				$scope.nexusUserName = "";
				$scope.nexusUserPassword = "";

				if ($scope.userId === "null") {
					return;
				}

				Restangular.all("application/installed-application?appType=nexusiq").getList().then(function (installedApps) {
                      $scope.nexusIQApps = installedApps;
                });

				Restangular.one("users", $scope.userId).get().then(
					function(user) {
						$scope.user = user;
						return Restangular.all("users/" + $scope.userId + "/groups").getList();
					}, accountModule.createErrorHandler($scope)
				)
				.then(
					function(groups) {
						$scope.groups = _.map(groups, function(group) {
							var icon = "spec-data-group-";
							icon += group.external ? "external-" : "internal-";
							icon += group.active ? "active" : "inactive";
							group.iconClass = icon;

							return {data: group, actions: [], defaultAction: undefined};
						});
					}, accountModule.createErrorHandler($scope)
				);
			};

			$scope.saveUserCreds = function() {
			    $scope.errors = [];
			    $scope.successMsg = null;

                Restangular.all("application/installed-application/" + $scope.nexusIQApps.chosenApp.id + "/saveCredentials").post(
					{userName: $scope.nexusUserName, password: $scope.nexusUserPassword}
				).then(function() {
                    $scope.editMode = false;
                    $scope.successMsg = "User Information updated";
                    showMask(false);
                }, function(error) {
                    $scope.errors.push("There was an error saving your credentials. Please try again or contact an Administrator.");
                    showMask(false);
                });
			};

			$scope.update = function() {
				$scope.errors = [];
				$scope.successMsg = null;

				if ($scope.password !== $scope.confirmPassword) {
					$scope.errors.push("New password and confirm password do not match!");
					return;
				}

				if ($scope.oldPassword === "" && $scope.password === "" && $scope.confirmPassword === "") {
					$scope.oldPassword = $scope.user.password;
					$scope.password = $scope.user.password;
				}

				var userData = $scope.user;
				userData.oldPassword = $scope.oldPassword;
				userData.password = $scope.password;
				showMask(true, "Updating account information");
				Restangular.one("account", $scope.userId).customPUT(userData).then(
					function() {
						$scope.editMode = false;
						$scope.successMsg = "User Information updated";
						showMask(false);
					}, accountModule.createErrorHandler($scope)
				);
			};

			$scope.switchMode = function() {
				$scope.editMode = !$scope.editMode;
			};

			//Register a listener for auth-state-changed so we can update the page accordingly
			$scope.$on("auth-state-changed", function() {
				authStateService.authStatePromise.then(function(authState) {
					$scope.userId = authState.currentUserId;
					updateAccountInformation();
				});
			});

			//Initialise the page when the controller is instantiated
			authStateService.authStatePromise.then(function(authState) {
				$scope.userId = authState.currentUserId !== null ? authState.currentUserId : "null";
				updateAccountInformation();
			});
		}
	]);
})();
