(function() {
	"use strict";
	var applicationsModule = angular.module("applicationsModule", ["ui.router",
                                                                    "angularUtils.directives.uiBreadcrumbs",
																	"spectrumLoginModule",
																	"spectrumHeaderModule",
																	"spectrumMenuModule",
																	"spectrumHeadingModule",
																	"spectrumFooterModule",
																	"spectrumTableModule",
																	"applicationTableModule",
																	"minicolors"
																	]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration & Initialisation
	///////////////////////////////////////////////////////////////////////////////////////////////////
	applicationsModule
	.constant("MINICOLORS_SETTINGS",
		{theme: "bootstrap", position: "bottom right", letterCase: "uppercase"}
	)
	.config(["$urlRouterProvider", "$stateProvider", "RestangularProvider", function($urlRouterProvider, $stateProvider, RestangularProvider) {
		setupDefaultRestangularUrlModifications(RestangularProvider);

		$urlRouterProvider.otherwise("/applications");
		$stateProvider
		.state('applications', {
            abstract: true,
            url: '/applications',
            // Note: abstract still needs a ui-view for its children to populate.
            template: '<ui-view/>',
            data: {
                breadcrumbProxy: 'applications.list'
            }
        })
		.state("applications.list", {
			url: "?linkcreated",
			params: {
				linkcreated: undefined
			},
			templateUrl: "partials/application-list.html",
			controller: "ListAppController",
			data: {
                displayName: 'Applications'
            }
		})
		.state("applications.create", {
			url: "/create",
			templateUrl: "partials/application-create.html",
			controller: "CreateController",
			data: {
                displayName: 'Create Application'
            }
		})
		.state('applications.edit', {
            abstract: true,
            url: '/:appId',
            // Note: abstract still needs a ui-view for its children to populate.
            template: '<ui-view/>',
            data: {
                breadcrumbProxy: 'applications.edit.detail'
            }
        })
		.state("applications.edit.detail", {
			url: "",
			templateUrl: "partials/application-edit.html",
			controller: "EditController",
			data: {
                displayName: 'Edit Application'
            }
		})
		.state("applications.edit.link", {
			url: "/link",
			templateUrl: "partials/application-link.html",
			controller: "LinkAppController",
			data: {
                displayName: 'Link Application'
            }
		});
	}])
	.createErrorHandler = spectrumRestangularErrorHandler;

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Controllers
	///////////////////////////////////////////////////////////////////////////////////////////////////
	applicationsModule
	.controller("CreateController", ["$scope", "Restangular", "authStateService", "MINICOLORS_SETTINGS",
		function($scope, Restangular, authStateService, MINICOLORS_SETTINGS) {
			showMask(true);
			$scope.hexColour = "#A0A0A0";
			$scope.minicolorsSettings = MINICOLORS_SETTINGS;

			var updateSupportedApps = function() {
				Restangular.all("application/supported-application").getList().then(
					function(supportedApps) {
						showMask(false);
						$scope.supportedApps = supportedApps;
					}, applicationsModule.createErrorHandler($scope)
				);
			}();

			$scope.create = function() {
				showMask(true, "Attempting to add application");
				var color = $scope.hexColour.substr(1); //get rid of the hash before sending to persistence layer
				Restangular.all("application/installed-application").post(
					{name: $scope.name, url: $scope.url, hexColour: color, supportedAppId: $scope.supportedApp.id}
				).then(
					function() {
						showMask(false);
						window.location = "applications.html";
					}, applicationsModule.createErrorHandler($scope)
				);
			};

			$scope.$on("auth-state-changed", function() {
				authStateService.authStatePromise.then(function(auth) {
					if (auth.isAdmin) {
						updateSupportedApps();
					} else {
						showMask(false);
					}
				});
			});
		}
	])
	.controller("EditController", ["$scope", "$stateParams", "Restangular", "MINICOLORS_SETTINGS",
		function($scope, $stateParams, Restangular, MINICOLORS_SETTINGS) {
			$scope.minicolorsSettings = MINICOLORS_SETTINGS;

			Restangular.one("application/installed-application", $stateParams.appId).get().then(
				function(application) {
					$scope.app = application;
					$scope.title = application.name;

					return Restangular.one("application/supported-application", application.supportedAppId).get();
				}, applicationsModule.createErrorHandler($scope)
			)
			.then(
				function(appType) {
					$scope.appType = appType.name;
				}, applicationsModule.createErrorHandler($scope)
			);

			$scope.editApp = function(appId) {
				showMask(true, "Editing application");
				var newAppData = {
					name: $scope.app.name,
					url: $scope.app.url,
					hexColour: $scope.app.hexColour.substr(1)
				};

				Restangular.one("application/installed-application", appId).customPUT(newAppData).then(
					function() {
						showMask(false);
						window.location = "applications.html";
					}, applicationsModule.createErrorHandler($scope)
				);
			};
		}
	]);

	applicationsModule.controller("ListAppController", ["$scope", "$stateParams", function($scope, $stateParams) {
		showMask(true, "Loading application details");
		if ($stateParams.linkcreated) {
			$scope.showLinkSuccessAlert = true;
		}
	}]);

	applicationsModule.controller("LinkAppController", ["$scope", "$stateParams", "Restangular", function($scope,
																	   $stateParams,
																	   Restangular) {
		showMask(true);
		$scope.authoriseApplication = function() {
			showMask(true, "Connecting to application for authorisation");
			Restangular.one("application",$stateParams.appId).post("request-token").then(
				function(tokenDetails) {
					window.location = tokenDetails.authoriseUrl;
				}, applicationsModule.createErrorHandler($scope)
			);
		}

		Restangular.all("application/supported-application").getList().then(
			function(supportedApps) {
					Restangular.one("application/installed-application", $stateParams.appId).get().then(
						function(application) {
							$scope.app = application;
							var appType = _.find(supportedApps,
								function(eachApp) {
									return eachApp.id == application.supportedAppId
							}).name;
							$scope.app.appType = appType;
							$scope.app.isBbServer = (appType == "Bitbucket Server");
							$scope.app.isConfluence = (appType == "Confluence");
							$scope.app.isJira = (appType == "Jira");
							showMask(false);
						}, applicationsModule.createErrorHandler($scope));

			}, applicationsModule.createErrorHandler($scope)
		);

		Restangular.one("host-key/public-key").get().then(
			function(key) {
				$scope.consumerKey = "clearvision";
				$scope.publicKey = key.publicKey;
			}, applicationsModule.createErrorHandler($scope));

		$("#accordion a").click(function(e) {
		    e.preventDefault();
		});
	}]);

})();
