(function() {
	"use strict";
	var groupsModule = angular.module("groupsModule", ["ui.router",
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
	groupsModule
	.config(["$urlRouterProvider", "$stateProvider", "RestangularProvider", function($urlRouterProvider, $stateProvider, RestangularProvider) {
		setupDefaultRestangularUrlModifications(RestangularProvider);

		$urlRouterProvider.otherwise("/groups");
		$stateProvider
		.state('groups', {
	        abstract: true,
	        url: '/groups',
	        // Note: abstract still needs a ui-view for its children to populate.
	        template: '<ui-view/>',
	        data: {
	            breadcrumbProxy: 'groups.list'
	        }
	    })
		.state("groups.list", {
			url: "",
			templateUrl: "partials/all_group.html",
			controller: "ListController",
			data: {
                displayName: 'Groups'
            }
		})
		.state("groups.create", {
			url: "/create",
			templateUrl: "partials/add_group.html",
			controller: "CreateController",
			data: {
                displayName: 'Create Group'
            }
		})
		.state("groups.edit", {
			url: "/:groupId",
			templateUrl: "partials/edit_group.html",
			controller: "EditController",
			data: {
                displayName: 'Edit Group'
            }
		});

	}])
	.createErrorHandler = spectrumRestangularErrorHandler;

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Controllers
	///////////////////////////////////////////////////////////////////////////////////////////////////
	groupsModule
	.controller("ListController", ["$scope", "Restangular", "restTableModelService",
		function($scope, Restangular, restTableModelService) {
			showMask(true, "Loading group list");
			$scope.addActions = {
				name: "Add a new group",
				icon: "plus",
				run: "group.html#/groups/create"
			};

			$scope.groupRowModel = restTableModelService.createRestTableModel("groups", function(group) {
				var defaultAction = {
					run: "group.html#/groups/" + group.id
				};

				var icon = "spec-data-group-";
				icon += group.external ? "external-" : "internal-";
				icon += group.active ? "active" : "inactive";
				group.iconClass = icon;

				group.active = group.active ? "yes" : "no";

				return {data: group, actions: [], defaultAction: defaultAction};
			});
		}
	])
	.controller("CreateController", ["$scope", "Restangular",
		function($scope, Restangular) {
			$scope.active = true;

			$scope.createGroup = function() {
				var name = $scope.groupName.trim();

				var groupData = {name: name, role: $scope.role, active: $scope.active};
				showMask(true, "Creating group");
				Restangular.one("").post("groups", groupData).then(function() {
					showMask(false);
					window.location = "group.html#/groups";
				}, groupsModule.createErrorHandler($scope));
			};
		}
	])
	.controller("EditController", ["$scope", "$stateParams", "Restangular", "arrayTableModelService",
		function($scope, $stateParams, Restangular, arrayTableModelService) {
			showMask(true, "Loading group information");
			Restangular.one("groups", $stateParams.groupId).get().then(
				function(group) {
					$scope.group = group;
					$scope.title = group.name;

					return Restangular.all("users").getList();
				}, groupsModule.createErrorHandler($scope)
			)
			.then(
				function(users) {
					$scope.users = users;

					return Restangular.all("users/group/" + $scope.group.id).getList();
				}, groupsModule.createErrorHandler($scope)
			)
			.then(
				function(usersInGroup) {
					$scope.selectedUsers = arrayTableModelService.createArrayTableModel(usersInGroup, function(user) {
						return {
							data: user,
							actions: []
						};
					 }, true, ['name']);
					var selectedUserIds = _.pluck(usersInGroup, "id");
					$scope.availableUsers = arrayTableModelService.createArrayTableModel(
						_.filter($scope.users, function(user) { return selectedUserIds.indexOf(user.id) < 0; }),
						function(user) {
							return {
								data: user,
								actions: []
							};
						}, true, ['name']
					);
				}, groupsModule.createErrorHandler($scope)
			);

			$scope.deleteGroup = function(id) {
				$scope.error = null;

				bootbox.confirm("Are you sure?<br/>(Note: existing users will be removed from this group)",
					function(result) {
						if (result) {
							showMask(true, "Deleting group");
							Restangular.all("users/group/" + id).getList().then(function(usersInGroup) {
								angular.forEach(usersInGroup, function(userInGroup) {
									Restangular.one("users", userInGroup.id).one("groups", id).customDELETE();
									//.then(function() {}. groupsModule.createErrorHandler($scope));
								});

								Restangular.one("groups", id).remove().then(function() {
									showMask(false);
									window.location = "group.html#/groups";
								}, groupsModule.createErrorHandler($scope));
							}, groupsModule.createErrorHandler($scope));
						}
					}
				);
			};

			$scope.editGroup = function(id) {
				showMask(true, "Updating group");
				$scope.error = null;
				var groupData = {id: id, name: $scope.group.name, role: $scope.group.role, active: $scope.group.active,
									syncCycle: $scope.group.syncCycle, external: $scope.group.external,
									deleted: $scope.group.deleted
								};

				Restangular.one("groups", id).customPUT(groupData).then(function() {
					showMask(false);
					window.location = "group.html#/groups";
				}, groupsModule.createErrorHandler($scope));
			};

			$scope.changeGroupUsers = function(id) {
				delete $scope.error;

				var unselectedUserIds = _.pluck($scope.availableUsers.undecoratedRows, "id");
				var selectedUserIds = _.pluck($scope.selectedUsers.undecoratedRows, "id");

				//TODO[SPEC-1725] this logic is not very good! See ticket for details
				angular.forEach(selectedUserIds, function(selectedUserId, index) {
					Restangular.one("users", selectedUserId).one("groups", id).customPUT().then(
						function() {
							showMask(false);
							if (index === (selectedUserIds.length - 1)) {
								$scope.successMsg = "Group users updated!";
								$("html, body").animate({scrollTop: 0}, "fast");
							}
						}, groupsModule.createErrorHandler($scope)
					);
				});

				angular.forEach(unselectedUserIds, function(unselectedUserId) {
					Restangular.one("users", unselectedUserId).one("groups", id).customDELETE().then(
						function() {
							showMask(false);
							$scope.successMsg = "Group users updated!";
							$("html, body").animate({scrollTop: 0}, "fast");
						}, groupsModule.createErrorHandler($scope)
					);
				});
			};
		}
	]);
})();
