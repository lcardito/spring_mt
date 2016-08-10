(function() {
	"use strict";
	var usersModule = angular.module("usersModule", ["ui.router",
														"angularUtils.directives.uiBreadcrumbs",
														"spectrumLoginModule",
														"spectrumHeaderModule",
														"spectrumMenuModule",
														"spectrumHeadingModule",
														"spectrumFooterModule",
														"spectrumTableModule",
														"spectrumSelectorModule",
														"spectrumRestTableModelModule",
														"spectrumArrayTableModelModule"
														]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration & Initialisation
	///////////////////////////////////////////////////////////////////////////////////////////////////
	usersModule
	.config(["$urlRouterProvider", "$stateProvider", "RestangularProvider", function($urlRouterProvider, $stateProvider, RestangularProvider) {
		setupDefaultRestangularUrlModifications(RestangularProvider);

		$urlRouterProvider.otherwise("/users");
		$stateProvider
		.state('users', {
            abstract: true,
            url: '/users',
            // Note: abstract still needs a ui-view for its children to populate.
            template: '<ui-view/>',
            data: {
                breadcrumbProxy: 'users.list'
            }
        })
		.state("users.list", {
			url: "",
            templateUrl: "partials/all_user.html",
            controller: "ListController",
            data: {
                displayName: 'Users'
            }
        })
        .state("users.create", {
            url: "/create",
            templateUrl: "partials/add_user.html",
            controller: "CreateController",
            data: {
                displayName: 'Create User'
            }
        })
        .state("users.edit", {
            url: "/:userId",
            templateUrl: "partials/edit_user.html",
            controller: "EditController",
            data: {
                displayName: 'Edit User'
            }
        })
	}])
	.createErrorHandler = spectrumRestangularErrorHandler;

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Controllers
	///////////////////////////////////////////////////////////////////////////////////////////////////
	usersModule
	.controller("ListController", ["$scope", "Restangular", "restTableModelService",
		function($scope, Restangular, restTableModelService) {
			$scope.addActions = {
				name: "Add a new user",
				icon: "plus",
				run: "user.html#/users/create"
			};

			$scope.userRowModel = restTableModelService.createRestTableModel("users", function(user) {
				var defaultAction = {
					run: "user.html#/users/" + user.id
				};

				var icon = "spec-data-user-";
				icon += user.external ? "external-" : "internal-";
				icon += user.active ? "active" : "inactive";
				user.iconClass = icon;

				user.fullName = _.compact([user.firstName, user.lastName]).join(" ");
				user.active = user.active ? "yes" : "no";

				return {data: user, actions: [], defaultAction: defaultAction};
			});
		}
	])
	.controller("CreateController", ["$scope", "Restangular",
		function($scope, Restangular) {
			$scope.active = true;

			$scope.createUser = function() {
				$scope.errors = [];

				if ($scope.email === undefined) {
					$scope.email = null;
				}
				if ($scope.password !== $scope.confirmPassword) {
					$scope.errors.push("Password and confirm password do not match!");
				}
				showMask(true, "Creating user");
				var userData = {name: $scope.userName, password: $scope.password, email: $scope.email,
								role: $scope.role, syncCycle: 0, active: $scope.active, external: false,
								deleted: false, firstName: $scope.firstName, lastName: $scope.lastName
								};

				Restangular.one("").post("users", userData).then(function() {
					showMask(false);
					window.location = "user.html#/users";
				}, usersModule.createErrorHandler($scope));
			};
		}
	])
	.controller("EditController", ["$scope", "$stateParams", "Restangular", "arrayTableModelService",
		function($scope, $stateParams, Restangular, arrayTableModelService) {
			showMask(true, "Loading user information");
			Restangular.one("users", $stateParams.userId).get().then(
				function(user) {
					$scope.user = user;
					$scope.defaultFirstName = user.firstName;
					$scope.defaultLastName = user.lastName;

					return Restangular.all("groups").getList();
				}, usersModule.createErrorHandler($scope)
			)
			.then(
				function(groups) {
					$scope.groups = groups;

					return Restangular.all("users/" + $scope.user.id + "/groups").getList();
				}, usersModule.createErrorHandler($scope)
			)
			.then(
				function(userGroups) {
					$scope.selectedGroups = arrayTableModelService.createArrayTableModel(userGroups, function(user) {
						return {
							data: user,
							actions: []
						};
					}, true, ['name']);
					var selectedGroupIds = _.pluck(userGroups, "id");

					$scope.availableGroups =
						arrayTableModelService.createArrayTableModel(
							_.filter($scope.groups, function(group) { return selectedGroupIds.indexOf(group.id) < 0; }),
							function(user) {
                                return {data: user,
                                        actions: []
                                };
                             }, true, ['name']);
				}, usersModule.createErrorHandler($scope)
			);

			$scope.deleteUser = function(id) {
				$scope.error = null;

				bootbox.confirm("Are you sure?<br/>(Note: if logged in, his/her session will be expired)",
					function(result) {
						if (result) {
							showMask(true, "Deleting user");
							Restangular.all("users/" + id + "/groups").getList().then(function(groupsForUser) {
								angular.forEach(groupsForUser, function(groupForUser) {
									Restangular.one("users", id).one("groups", groupForUser.id).customDELETE();
								});

								Restangular.one("users", id).remove().then(function() {
									showMask(false);
									window.location = "user.html#/users";
								}, usersModule.createErrorHandler($scope));
							}, usersModule.createErrorHandler($scope));
						}
					}
				);
			};

			$scope.editUser = function(id) {
				$scope.errors = [];

				if ($scope.password !== $scope.confirmPassword) {
					$scope.errors.push("New password and confirm password do not match!");
					return;
				}

				if ($scope.password === "" && $scope.confirmPassword === "") {
					$scope.password = $scope.user.password;
				}
				showMask(true, "Saving user");
				var userData = {name: $scope.user.name, password: $scope.password, email: $scope.user.email,
								role: $scope.user.role, syncCycle: $scope.user.syncCycle, active: $scope.user.active,
								external: $scope.user.external, deleted: $scope.user.deleted,
								firstName: $scope.user.firstName, lastName: $scope.user.lastName
								};

				Restangular.one("users", id).customPUT(userData).then(function() {
					showMask(false);
					window.location = "user.html#/users";
				}, usersModule.createErrorHandler($scope));
			};

			$scope.changeUserGroups = function(id) {
				delete $scope.error;

				var unselectedGroupIds = _.pluck($scope.availableGroups.undecoratedRows, "id");
				var selectedGroupIds = _.pluck($scope.selectedGroups.undecoratedRows, "id");

				//TODO[SPEC-1725] this logic is not very good! See ticket for details
				angular.forEach(selectedGroupIds, function(selectedGroupId, index) {
					Restangular.one("users", id).one("groups", selectedGroupId).customPUT().then(
						function() {
							if (index === (selectedGroupIds.length - 1)) {
								$scope.successMsg = "User groups updated!";
								$("html, body").animate({scrollTop: 0}, "fast");
							}
						}, usersModule.createErrorHandler($scope)
					);
				});

				angular.forEach(unselectedGroupIds, function(unselectedGroupId) {
					Restangular.one("users", id).one("groups", unselectedGroupId).customDELETE().then(
						function() {
							$scope.successMsg = "User groups updated!";
							$("html, body").animate({scrollTop: 0}, "fast");
						}, usersModule.createErrorHandler($scope)
					);
				});
			};
		}
	]);
})();
