(function() {
	"use strict";
	var menuModule = angular.module("spectrumMenuModule", [
		"spectrumLoginModule",
		"restangular"
	]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration & Initialisation
	///////////////////////////////////////////////////////////////////////////////////////////////////
	menuModule
	.config(["RestangularProvider", function(RestangularProvider) {
		RestangularProvider.setBaseUrl(baseUrl + "/rest-with-cookies/api/v1");
	}])
	.shouldShowMenuItem = function(authState, itemAttributes) {
		if (itemAttributes.loggedinuseronly === "true" && !authState.isLoggedIn) {
            return false;
        }
        if (itemAttributes.administratoronly === "true" && !authState.isAdmin) {
            return false;
        }
        return true;
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Controllers
	///////////////////////////////////////////////////////////////////////////////////////////////////
	menuModule
	.controller("MenuController", ["$scope", "$filter", "Restangular", "authStateService",
		function($scope, $filter, Restangular, authStateService) {
			$scope.dashboardLinks = [];
			authStateService.authStatePromise.then(
                function(authState) {
                    if (authState.isLoggedIn) {
                        $scope.dashboardLinks.push({
                            id: "menu-item-spec-personalised-dashboard",
                            name: "Personalised Dashboard",
                            url: "personalised-dashboard.html#/personalised-dashboard"
                        });
                    }

                    Restangular.all("application/installed-application").getList().then(
                        function(apps) {
                            if (apps.length > 0) {
                                if (!_.isEmpty($scope.dashboardLinks)) {
                                    $scope.dashboardLinks.push({});
                                }

                                var applications = _.map(apps, function(eachApp) {
                                    return {id: "applink-" + eachApp.id, name: eachApp.name, url: eachApp.url, external: true};
                                });

                                applications = $filter("orderBy")(applications, "name", false);
                                $scope.dashboardLinks = $scope.dashboardLinks.concat(applications);
                            }
                        },
                        function() {
                            $scope.dashboardLinks.splice(1, 1);
                            $scope.dashboardLinks.push({
                                id: "dashboards-error",
                                name: "Can't retrieve apps",
                                url: "#"
                            });
                        }
                    );
                }
            );

			$scope.applicationLinks = [{
				id: "application",
				name: "Applications Manager",
				url: "applications.html"
			}];

			$scope.userLinks = [
				{
					id: "user-manage",
					name: "User Management",
					url: "user.html"
				},
				{
					id: "group-manage",
					name: "Group Management",
					url: "group.html"
				},
				{
					id: "userdirectory-manage",
					name: "User Directories",
					url: "userdirectories.html"
				}
			];

			$scope.processesLinks = [
            	{
            		id: "processes",
            		name: "Processes",
            		url: "process.html"
            	},
            	{
                    id: "process-report-generator",
                    name: "Process Report Generator",
                    url: "process.html#/processes/report-generator"
                }
            ];

			$scope.documentationLinks = [{
				id: "docs-error",
				name: "Can't retrieve documentation",
				url: "#"
			}];

			Restangular.all("docs").getList().then(
				function(docs) {
					for (var i = 0; i < docs.length; i++) {
						var item = docs[i];
						item.id = "docs-" + item.name;
						item.name = item.prettyName;
						item.external = true;
						delete item.prettyName;
					}
					$scope.documentationLinks = docs;
				}
			);
		}
	]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Directives
	///////////////////////////////////////////////////////////////////////////////////////////////////
	menuModule
	.directive("spectrumMenu",
		function() {
			//Defines the entire top-nav menu construct
			return {
				restrict: "E",
				templateUrl: "partials/menu.html",
				replace: true
			};
		}
	)
	.directive("spectrumUserMenu",
		function() {
			//Defines the 'Login/Logout + Account + Help' mini-menu to the right of the top-nav
			return {
				restrict: "E",
				templateUrl: "partials/user_menu.html",
				replace: true
			};
		}
	)
	.directive("spectrumMenuItem", ["$rootScope", "Restangular", "authStateService",
		function($rootScope, Restangular, authStateService) {
			//Defines a single menu item in the top-nav

			var link = function($scope, element, attributes) {
				authStateService.authStatePromise.then(
					function(authState) {
						$scope.show = menuModule.shouldShowMenuItem(authState, attributes);
					}
				);

				$scope.$on("auth-state-changed", function() {
					authStateService.authStatePromise.then(
						function(authState) {
							$scope.show = menuModule.shouldShowMenuItem(authState, attributes);
						}
					);
				});

				//This might be bad practice (checking directly for win.loc.href)? Works though!
				if (window.location.href.indexOf(baseUrl + "/" + attributes.page) > -1) {
					$scope.class = "active";
				}
			};

			return {
				restrict: "E",
				templateUrl: "partials/menu_item.html",
				replace: true,
				scope: {
					title: "@",
					page: "@",
					view: "@",
					administratoronly: "@",
					loggedinuseronly: "@"
				},
				link: link
			};
		}
	])
	.directive("spectrumMenuDropDown", ["authStateService",
		function(authStateService) {
			//Defines a single drop-down menu item in the top-nav. Basically an enhanced SpectrumMenuItem

			var link = function($scope, element, attributes) {
				authStateService.authStatePromise.then(
                    function(authState) {
                        $scope.show = menuModule.shouldShowMenuItem(authState, attributes);
                    }
                );

                $scope.$on("auth-state-changed", function() {
                    authStateService.authStatePromise.then(
                        function(authState) {
                            $scope.show = menuModule.shouldShowMenuItem(authState, attributes);
                        }
                    );
                });
			};

			return {
				restrict: "E",
				templateUrl: "partials/menu_drop_down.html",
				replace: true,
				scope: {
					title: "@",
					page: "@",
					actions: "=",
					view: "@",
					administratoronly: "@",
					loggedinuseronly: "@"
				},
				link: link
			};
		}
	]);
})();
