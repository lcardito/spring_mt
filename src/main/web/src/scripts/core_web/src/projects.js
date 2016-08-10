(function() {
	"use strict";
	var projectsModule = angular.module("projectsModule", ["ui.router",
                                                           "angularUtils.directives.uiBreadcrumbs",
														   "ngAnimate",
													       "angularBootstrapNavTree",
														   "spectrumLoginModule",
														   "spectrumHeaderModule",
														   "spectrumMenuModule",
														   "spectrumHeadingModule",
														   "spectrumFooterModule",
														   "spectrumTableModule",
														   "spectrumSelectorModule",
														   "spectrumRestTableModelModule",
														   "spectrumArrayTableModelModule",
														   "spectrumTransformModule",
	]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration & Initialisation
	///////////////////////////////////////////////////////////////////////////////////////////////////
	projectsModule
		.constant("DATE_FORMAT",
			"MMM Do, YYYY h:mm:ss A"
		)
		.config(["$urlRouterProvider", "$stateProvider", "RestangularProvider", function($urlRouterProvider, $stateProvider, RestangularProvider) {
			setupDefaultRestangularUrlModifications(RestangularProvider);

			$urlRouterProvider.otherwise("/projects");
			$stateProvider
			.state('projects', {
                abstract: true,
                url: '/projects',
                // Note: abstract still needs a ui-view for its children to populate.
                template: '<ui-view/>',
                data: {
                    breadcrumbProxy: 'projects.list'
                }
            })
				.state("projects.list", {
					url: "",
					templateUrl: "partials/project-list.html",
					controller: "ListController",
					data: {
                        displayName: 'Projects'
                    }
				})
				.state("projects.create", {
					url: "/create",
					templateUrl: "partials/project-create.html",
					controller: "CreateController",
					data: {
                        displayName: 'Create Project'
                    }
				});
		}])
		.createErrorHandler = function($scope) {
			return function(err) {
				spectrumRestangularErrorHandler($scope);
				document.getElementById("btn-spec-project-save").disabled = false;
			};
		};
	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Controllers
	///////////////////////////////////////////////////////////////////////////////////////////////////
	projectsModule
		.controller("ListController", ["$scope", "Restangular", "restTableModelService", "DATE_FORMAT",
			function($scope, Restangular, restTableModelService, DATE_FORMAT) {
				showMask(true, "Loading project information")
				$scope.addActions = {
					name: 'Create a new project',
					icon: 'plus',
					run: 'project.html#/projects/create'
				};

				var allSupportedApps = [];
				var userGroupUsers;
				Restangular.all("application/installed-application").getList().then(function(installedApps) {
					var installedAppsDict = {};
					angular.forEach(installedApps, function(app) {
						installedAppsDict[app.id] = app;
					});
					Restangular.all("application/supported-application").getList().then(
						function(supportedApps) {
							allSupportedApps = supportedApps;

							$scope.projectRowModel = restTableModelService.createRestTableModel("projects", function(project) {
								var actionObjects = [];
								var defaultAction = {
									run: "project.html#/projects/" + project.id
								};
								var projectApp = [];
								project.appNames = '';
								angular.forEach(project.applicationIds, function(appId) {
									var thisApp = installedAppsDict[appId];
									projectApp.push(thisApp);
									project.appNames = project.appNames.concat(thisApp.name, ":  ");
									var appType = _.result(_.find(allSupportedApps, {
										'id': thisApp.supportedAppId
									}), 'name');
									//Note this will become "logo icon-blank glyphicon glyphicon-ok", which we only actually want the last 2
									//classes, the first 2 are dummys and will be ignored
									project[appType.toLowerCase().replace(" ", "") + "App"] = "blank glyphicon glyphicon-ok";
									switch (appType.toLowerCase()) {
										case "jira":
											actionObjects.push({
												name: "JIRA Homepage",
												icon: "share",
												class: "default",
												url: thisApp.url + "/browse/" + project.key,
												external: true
											});
											break;
										case "confluence":
											var projectAppSettings = _.find(project.projectApplicationDetails, {
												'id': appId
											});
											var spaceKey = project.key;
											var suffix = "";
											//Notice this is a string not a boolean
											if (projectAppSettings.projectParameters.createSpace == "false") {
												spaceKey = projectAppSettings.projectParameters.spaceKey;
												suffix = "/" + encodeURIComponent(project.name);
											}
											var pageUrl = thisApp.url + "/display/" + spaceKey + suffix;
											actionObjects.push({
												name: "Confluence Homepage",
												icon: "share",
												class: "default",
												url: pageUrl,
												external: true
											});
											break;
										case "bitbucket server":
											actionObjects.push({
												name: "Bitbucket Server Homepage",
												icon: "share",
												class: "default",
												url: thisApp.url + "/projects/" + project.key,
												external: true
											});
											break;
									}
								});
								project.apps = projectApp;
								project.createdDate = moment(new Date(project.createdDate)).format(DATE_FORMAT);
								return {
									data: project,
									actions: actionObjects,
									defaultAction: undefined
								};
							});
						}, projectsModule.createErrorHandler($scope)
					);
				})
			}
		])
		.controller("CreateController", ["$scope", "$q", "Restangular", "authStateService", "restTableModelService",
			"arrayTableModelService", "$timeout", "$window",

			function($scope, $q, Restangular, authStateService, restTableModelService, arrayTableModelService, $timeout, $window) {
				showMask(true, "Loading project information");

				/////////////////////////////////////////////////////////////////////////////////////////////
				// initialisation + setup
				/////////////////////////////////////////////////////////////////////////////////////////////
				var retrievedGroups = [];
				var retrievedUsers = [];
				var allSupportedApps = [];
				$scope.appSubmitted = false;
				$("#panel-spec-projects-apps").collapse("show");

				Restangular.all("application/supported-application").getList().then(
					function(supportedApps) {
						allSupportedApps = supportedApps;
						Restangular.all("groups").getList().then(
							function(groups) {
								retrievedGroups =
									_(groups)
									.filter({
										"external": true,
										"active": true,
										"deleted": false
									})
									.map(function(group) {
										return {
											id: group.id,
											name: group.name,
											role: group.role
										};
									})
									.value();
								$scope.adminGroupOptions = $scope.userGroupOptions = retrievedGroups.slice();
								$scope.adminGroupId = '';
								$scope.userGroupId = '';
							}, projectsModule.createErrorHandler($scope)
						);

						var projectWizardSupportedApps = [];
						var apps = [];

						Restangular.all("application/installed-application").getList().then(
							function(installedApps) {
								var remainingApps = installedApps.length;
								if (remainingApps == 0) {
									showMask(false);
								}
								Restangular.all("projects/supported-application").getList().then(
									function(installedProjectWizardApps) {
										$scope.projectWizardSupportedApps = installedProjectWizardApps.slice();
										angular.forEach(installedApps, function(eachInstalledApp) {
                                            var linkStatus = ""
                                            var isDisabled;
                                            if (eachInstalledApp.linkConfigured) {
                                                if (eachInstalledApp.status == "RUNNING") {
                                                    linkStatus = "Configured";
                                                    isDisabled = false;
                                                } else {
                                                    linkStatus = "Stopped";
                                                    isDisabled = true;
                                                }
                                            } else {
                                                isDisabled = true;
                                                if (_.find($scope.projectWizardSupportedApps,
                                                        function(eachApp) {
                                                            return eachApp.id == eachInstalledApp.supportedAppId
                                                        })) {
                                                    linkStatus = "Not-Authenticated";
                                                } else {
                                                    linkStatus = "Not-Supported";
                                                }
                                            }
                                            var appType = _.find(allSupportedApps,
                                                function(eachApp) {
                                                    return eachApp.id == eachInstalledApp.supportedAppId
                                                }).name;
                                            var appDetails = {
                                                id: eachInstalledApp.id,
                                                name: eachInstalledApp.name,
                                                type: _.find(allSupportedApps,
                                                    function(eachApp) {
                                                        return eachApp.id == eachInstalledApp.supportedAppId
                                                    }).name,
                                                status: linkStatus,
                                                selected: !isDisabled,
                                                isDisabled: isDisabled,
                                                jiraTemplates: null,
                                                createSpace: true,
                                                spaceData: [{
                                                    label: "Loading...",
                                                    children: ["Please wait."]
                                                }]
                                            };

                                            if (appType.toLowerCase() != "crowd") {
                                                apps.push(appDetails);
                                            }
                                            remainingApps -= 1;
                                            if (remainingApps == 0) {
                                                showMask(false);
                                            }
                                        }, function() {
                                            remainingApps -= 1;
                                            if (remainingApps == 0) {
                                                showMask(false);
                                            }
                                        });
									}, projectsModule.createErrorHandler($scope));
								$scope.apps = apps;
							}, projectsModule.createErrorHandler($scope)
						);

						$scope.availableUsers = convertToSelectTable([]);
						$scope.availableAdminUsers = convertToSelectTable([]);
						$scope.selectedUsers = convertToSelectTable([]);
						$scope.selectedAdminUsers = convertToSelectTable([]);
						Restangular.all("users").getList().then(
							function(users) {
								$scope.allUsers = users;
								var externalUsers = [];
								angular.forEach(users, function(user) {
									if (user.external) {
										externalUsers.push(user);
									}
								});
								$scope.availableUsers = convertToSelectTable(externalUsers.slice());
								$scope.availableAdminUsers = convertToSelectTable(externalUsers.slice());
							}, projectsModule.createErrorHandler($scope)
						);

					}, projectsModule.createErrorHandler($scope)
				);

				function convertToSelectTable(items) {
					return arrayTableModelService.createArrayTableModel(items, function(user) {
						return {
							data: user
						};
					}, false, ['name']);
				}

				$scope.getGroupMembers = function(groupId, adminUsers) {
					if (groupId === null || groupId === undefined || groupId === "") {
						if (adminUsers) {
							$scope.adminUsersInGroup = [];
						} else {
							$scope.usersInGroup = [];
						}
						return;
					}
					Restangular.all("users/group/" + groupId).getList().then(
						function(users) {
							if (adminUsers) {
								$scope.adminUsersInGroup = users;
							} else {
								$scope.usersInGroup = users;
							}

						}, projectsModule.createErrorHandler($scope)
					);
				};

				$scope.keyValid = false;
				var previousKeyTested = "ThIsKeYwAsNeVeRtEsTeD"; //Don't use empty string

				$scope.checkKeyAvailable = function(shouldShowMask, forceTest) {
					if (!forceTest && $scope.key == previousKeyTested) {
						$timeout(function() {
							previousKeyTested = "ThIsKeYwAsNeVeRtEsTeD"; //To allow force re-testing
						}, 300);
						disablePrivilegesStep($scope);
						var deferred = $q.defer();
						deferred.resolve(false);
						return deferred.promise;
					}
					if (shouldShowMask != undefined && shouldShowMask) {
						showMask(true, "Checking key available");
					}
					var promise = authStateService.authStatePromise.then(
						function(authState) {
							var checkedIcon = document.getElementById("project-key-validated");
							checkedIcon.className = "glyphicon glyphicon-refresh glyphicon-refresh-animate";
							checkedIcon.style.color = "black";

							//Wrap in timeout to make sure scope is up to date after the debounce
							return $timeout(function() {
								if ($scope.key === undefined || $scope.key === "") {
									showMask(false);
									checkedIcon.className = "glyphicon glyphicon-remove-sign";
									checkedIcon.style.color = "red";
									$scope.keyValid = false;
									return disablePrivilegesStep($scope);
								}
								previousKeyTested = $scope.key;
								var selectedApps = getSelectedApps(false);
								return Restangular.all("projects/validate-key").post({
									key: $scope.key,
									projectApplicationDetailsList: selectedApps,
									projectName: $scope.name
								}).then(
									function(response) {
										showMask(false);
										$scope.keyValid = response.keyValid;
										if (response.keyValid) {
											checkedIcon.className = "glyphicon glyphicon-ok-sign";
											checkedIcon.style.color = "green";
											delete $scope.error;

											return true;
										} else {
											checkedIcon.className = "glyphicon glyphicon-remove-sign";
											checkedIcon.style.color = "red";
											//The following line is commented out, use it when screaming at tests
											//$("body").append($(document.createElement("h1")).text(JSON.stringify(response)));
											return disablePrivilegesStep($scope);
										}
									},
									function(err) {
										showMask(false);
										$scope.keyValid = false;
										checkedIcon.className = "glyphicon glyphicon-remove-sign";
										checkedIcon.style.color = "red";
										projectsModule.createErrorHandler($scope)(err);
										return disablePrivilegesStep($scope);
									}
								);
							});
						}
					);

					function disablePrivilegesStep($scope) {
						$scope.detailsSubmitted = false;
						$scope.privilegesSubmitted = false;
						$("#panel-spec-projects-users").collapse("hide");

						return false;
					}

					return promise
				};

				$scope.projectKeyKeyUp = _.debounce($scope.checkKeyAvailable, 10);
				$scope.$watch("key", function() {
					if ($scope.key === undefined) {
						return;
					}
					$scope.key = $scope.key.toLocaleUpperCase().replace(/\W/g, '').replace("_", "");
					$scope.key = $scope.key.substring(0, Math.min($scope.key.length, 10));
				});

				$scope.$watch('name', function() { //Update the project key when the project name changes
					if ($scope.name === undefined) {
						return;
					}

					$scope.key = '';
					var pn = $scope.name.replace("_", "");
					var words = pn.split(" ");

					if (words.length === 1) {
						$scope.key = pn.replace(/\W/g, '').substring(0, Math.min(pn.length, Math.max(4, Math.floor(pn.length / 2)))).toUpperCase();
					} else {
						for (var i = 0; i < words.length; i++) {
							var charOne = words[i][0];
							if (charOne !== undefined) {
								charOne = charOne.replace(/\W/g, '');
								if (charOne !== "") {
									$scope.key += words[i][0].toUpperCase();
								}
							}
						}
					}
					$scope.key = $scope.key.substring(0, Math.min($scope.key.length, 10));
				});

				$scope.projectUsernames = [];
				$scope.projectAdminUsernames = [];

				$scope.$watch("adminGroupId", function() {
					if ($scope.adminGroupId === undefined) {
						return;
					}
					$scope.getGroupMembers($scope.adminGroupId, true);
				});

				$scope.$watch("userGroupId", function() {
					if ($scope.createNewUserGroup === undefined) {
						return;
					}
					$scope.getGroupMembers($scope.userGroupId, false);
				});

				/////////////////////////////////////////////////////////////////////////////////////////////
				// utility functions
				/////////////////////////////////////////////////////////////////////////////////////////////
				var updateHeaderIcon = function(which) {
					var id = "panel-spec-projects-" + which + "-header-icon";

					var element = document.getElementById(id);

					if (element !== undefined && element !== null) {
						element.className = "pull-right glyphicon glyphicon-plus";
					}
				};

				/////////////////////////////////////////////////////////////////////////////////////////////
				// $scope utility functions
				/////////////////////////////////////////////////////////////////////////////////////////////
				$scope.changeIcon = function(id) {
					var c = document.getElementById(id).className;
					if (c.indexOf("plus") > -1) {
						c = c.replace("plus", "minus");
					} else {
						c = c.replace("minus", "plus");
					}

					document.getElementById(id).className = c;
				};

				$scope.getChildPages = function(branch) {
					authStateService.authStatePromise.then(
						function(authState) {
							var urlParam = "?";
							if (branch.data != "" && branch.data != undefined && branch.data != null) {
								var app = _($scope.apps).filter({
									"id": branch.appId
								}).value()[0];

                                app.selectedSpaceData = app.spaceData;

								if (branch.data.key != "" && branch.data.key != undefined && branch.data.key != null) {
									urlParam += "spaceKey=" + branch.data.key;
									_.merge(app, {
										"confluenceSpaceKey": branch.data.key
									});
								}

								if (branch.data.pageId != "" && branch.data.pageId != undefined && branch.data.pageId != null) {
									urlParam += "&pageId=" + branch.data.pageId;
									_.merge(app, {
										"confluencePageId": branch.data.pageId
									});
								}

								// get all top level pages in a space
								Restangular.all("application/" + branch.appId + "/confluence/child-page" + urlParam)
									.getList().then(function(allTopLevelPages) {
										var childPages = [];
										angular.forEach(allTopLevelPages, function(eachPage) {
											var page = {
												label: eachPage.name,
												data: {
													pageId: eachPage.id
												},
												appId: branch.appId,
												children: {},
											};
											childPages.push(page);
										});
										branch.children = childPages;
									}, projectsModule.createErrorHandler($scope));
							}
						}
					);
				};


				/////////////////////////////////////////////////////////////////////////////////////////////
				// Details Section
				/////////////////////////////////////////////////////////////////////////////////////////////
				$scope.submitDetails = function($event, shouldShowMask) {
					delete $scope.error;

					return $scope.checkKeyAvailable(shouldShowMask, true).then(function(valid) {
						if (valid) {
							delete $scope.error;
							$scope.detailsSubmitted = true;
							updateHeaderIcon("details");
							$("#panel-spec-projects-details").collapse("hide");
							$("#panel-spec-projects-users").collapse("show");
						} else {
							$scope.error = "Please fill in all details correctly before continuing";
							$("#panel-spec-projects-details").collapse("show");
							$scope.detailsSubmitted = false;
						}

						return valid;
					});
				};

				$scope.createNewAdminGroup = false;
				$scope.newAdminGroupNeeded = function() {
					$scope.createNewAdminGroup = true;
					$scope.adminGroupId = '';
				};

				$scope.createNewUserGroup = false;
				$scope.newUserGroupNeeded = function() {
					$scope.createNewUserGroup = true;
					$scope.userGroupId = '';
				};

				$scope.submitNewAdminGroup = function() {
					$scope.newAdminGroupCreated = true;
					$scope.submittedAdminUsers = $scope.selectedAdminUsers.slice();
				};

				$scope.submitNewUserGroup = function() {
					$scope.newUserGroupCreated = true;
					$scope.submittedNormalUsers = $scope.selectedNormalUsers.slice();
				};

				/////////////////////////////////////////////////////////////////////////////////////////////
				// Applications Section
				/////////////////////////////////////////////////////////////////////////////////////////////
				$scope.changeApp = function($event, isCreateProjectValidation) {
					if (!isCreateProjectValidation) {
						$scope.appSubmitted = false;
						$('#panel-spec-projects-apps').collapse("show");
						$scope.appSettingsSubmitted = false;
						$('#panel-spec-projects-app-settings').collapse("hide");
						$scope.detailsSubmitted = false;
						$('#panel-spec-projects-details').collapse("hide");
						$scope.privilegesSubmitted = false;
						$('#panel-spec-projects-users').collapse("hide");
					}

					var selectedApps = _($scope.apps).filter({
						"selected": true
					}).value();

					if (selectedApps.length == 0) {
						if (isCreateProjectValidation) {
							$scope.error = "Please select an application before continuing ";
						}

						$scope.appSubmitted = false;
						$('#panel-spec-projects-apps').collapse("show");
						$scope.appSettingsSubmitted = false;
						$('#panel-spec-projects-app-settings').collapse("hide");
						$scope.detailsSubmitted = false;
						$('#panel-spec-projects-details').collapse("hide");
						$scope.privilegesSubmitted = false;
						$('#panel-spec-projects-users').collapse("hide");

						return false;
					}

					return true;
				};

				$scope.checkApps = function($event) {
					authStateService.authStatePromise.then(
						function(authState) {
							delete $scope.error;
							var selectedApps = _($scope.apps).filter({
								"selected": true
							}).value();
							if (selectedApps.length == 0) {
								$scope.error = "Please select an application before continuing";
								return;
							}

							var selectedAppsIds = [];
							angular.forEach($scope.apps, function(app) {
								if (!app.selected) {
									return;
								}
								selectedAppsIds.push(app.id);
							});
							$scope.selectedAppsIds = selectedAppsIds;
							$scope.appSubmitted = true;

							var jiraApps = _(selectedApps).filter({
								"type": "JIRA"
							}).value();
							var confluenceApps = _(selectedApps).filter({
								"type": "Confluence"
							}).value();

							$('#panel-spec-projects-apps').collapse("hide");
							if (jiraApps.length == 0 && confluenceApps.length == 0) {
								$scope.appSettingsSubmitted = true;
								$('#panel-spec-projects-app-settings').collapse("hide");
								$('#panel-spec-projects-details').collapse("show");
							} else {
								var remainingAppSettings = selectedApps.length;
								showMask(true, "Loading specific app setting options");
								angular.forEach(selectedApps, function(app) {
									switch (app.type.toLowerCase()) {
										case "jira":
											Restangular.all("application/" + app.id + "/jira/project-template").getList()
												.then(
													function(allJiraTemplates) {
														app.jiraTemplates = allJiraTemplates;
														remainingAppSettings -= 1;
														if (remainingAppSettings == 0) {
															showMask(false);
														}
													}, projectsModule.createErrorHandler($scope)
												);
											break;
										case "confluence":
                                            if (app.selectedSpaceData) {
                                                app.spaceData = app.selectedSpaceData;
                                                app.createSpace = false;
                                                showMask(false);
                                            } else {
                                                Restangular.all("application/" + app.id + "/confluence/space").getList()
                                                    .then(function (allConfluenceSpaces) {
                                                        var spaces = [];

                                                        angular.forEach(allConfluenceSpaces, function (eachSpace) {
                                                            var space = {
                                                                label: eachSpace.name,
                                                                data: {
                                                                    key: eachSpace.key
                                                                },
                                                                appId: app.id,
                                                                children: {}
                                                            };
                                                            spaces.push(space);
                                                        });

                                                        app.spaceData = [{
                                                            label: "Select Parent Page",
                                                            children: spaces
                                                        }];
                                                        remainingAppSettings -= 1;
                                                        if (remainingAppSettings == 0) {
                                                            showMask(false);
                                                        }
                                                    }, projectsModule.createErrorHandler($scope));
                                            }
											break;
										default:
											remainingAppSettings -= 1;
											if (remainingAppSettings == 0) {
												showMask(false);
											}
											break;
									}
								});

								$('#panel-spec-projects-app-settings').collapse("show");
							}
						}
					);
				};

				$scope.changeAppSettings = function($event, isCreateProjectValidation) {
					if (!isCreateProjectValidation) {
						$scope.appSettingsSubmitted = false;
						$('#panel-spec-projects-app-settings').collapse("show");
						$scope.detailsSubmitted = false;
						$('#panel-spec-projects-details').collapse("hide");
						$scope.privilegesSubmitted = false;
						$('#panel-spec-projects-users').collapse("hide");
					}

					var selectedApps = _($scope.apps).filter({
						"selected": true
					}).value();
					var jiraApps = _(selectedApps).filter({
						"type": "JIRA"
					}).value();
					var confluenceApps = _(selectedApps).filter({
						"type": "Confluence"
					}).value();

					var allTemplatesSelected = true;
					angular.forEach(jiraApps, function(eachJiraApp) {
						if (eachJiraApp.jiraTemplateModuleKey == "" || eachJiraApp.jiraTemplateModuleKey == undefined) {
							allTemplatesSelected = false;
						}
					});

					if (isCreateProjectValidation && !allTemplatesSelected) {
						$scope.error = "Select Project Template for JIRA before continuing";
					}

					var allSpacesChosen = true;
					angular.forEach(confluenceApps, function(eachApp) {
                        if (eachApp.createSpace) {
                            delete eachApp.selectedSpaceData;
                        } else {
                            eachApp.selectedSpaceData = eachApp.spaceData;
                        }
						if (!eachApp.createSpace && (eachApp.confluenceSpaceKey == "" || eachApp.confluenceSpaceKey == undefined)) {
							allSpacesChosen = false;
						}
					});

					if (isCreateProjectValidation && !allSpacesChosen) {
						$scope.error = "Select space options for Confluence before continuing";
					}

					if (!allTemplatesSelected || !allSpacesChosen) {
						$scope.appSettingsSubmitted = false;
						$('#panel-spec-projects-app-settings').collapse("show");
						$scope.detailsSubmitted = false;
						$('#panel-spec-projects-details').collapse("hide");
						$scope.privilegesSubmitted = false;
						$('#panel-spec-projects-users').collapse("hide");

						return false;
					}

					return true;
				};

				$scope.checkAppSettings = function($event) {
					$scope.detailsSubmitted = false;
					$('#panel-spec-projects-details').collapse("hide");
					$scope.privilegesSubmitted = false;
					$('#panel-spec-projects-users').collapse("hide");

					delete $scope.error;
					var selectedApps = _($scope.apps).filter({
						"selected": true
					}).value();
					var jiraApps = _(selectedApps).filter({
						"type": "JIRA"
					}).value();
					var confluenceApps = _(selectedApps).filter({
						"type": "Confluence"
					}).value();

					var allTemplatesSelected = true;
					angular.forEach(jiraApps, function(eachJiraApp) {
						if (eachJiraApp.jiraTemplateModuleKey == "" || eachJiraApp.jiraTemplateModuleKey == undefined) {
							allTemplatesSelected = false;
							return false;
						}
					});
					if (!allTemplatesSelected) {
						$scope.error = "Select Project Template for JIRA before continuing";
						return;
					}

					var allSpacesChosen = true;
					angular.forEach(confluenceApps, function(eachApp) {
						if (!eachApp.createSpace && (eachApp.confluenceSpaceKey == "" || eachApp.confluenceSpaceKey ==
								undefined)) {
							allSpacesChosen = false;
							return false;
						}
					});
					if (!allSpacesChosen) {
						$scope.error = "Select space options for Confluence before continuing";
						return;
					}

					$scope.appSettingsSubmitted = true;
					$('#panel-spec-projects-app-settings').collapse("hide");
					$('#panel-spec-projects-details').collapse("show");
				};

				function getSelectedApps(confluenceOnly) {
					var selectedApps = [];
					angular.forEach($scope.apps, function(app) {
						if (!app.selected) {
							return;
						}
						var thisApp = {};
						thisApp.id = app.id;
						switch (app.type.toLowerCase()) {
							case "jira":
								if (confluenceOnly) {
									break;
								}
								var jiraDetail = {
									projectTemplateModuleKey: app["jiraTemplateModuleKey"],
									projectTemplateWebItemKey: _.result(_.find(app.jiraTemplates, {
											'projectTemplateModuleKey': app["jiraTemplateModuleKey"]
										}),
										'projectTemplateWebItemKey')
								};
								thisApp.jiraDetail = jiraDetail;
							case "confluence":
								var confluenceDetails = {
									spaceKey: app["confluenceSpaceKey"],
									createSpace: app["createSpace"],
									parentPageId: app["confluencePageId"]
								}
								thisApp.confluenceDetail = confluenceDetails;
						}
						selectedApps.push(thisApp);
					});
					return selectedApps;
				}

				/////////////////////////////////////////////////////////////////////////////////////////////
				//Create project
				/////////////////////////////////////////////////////////////////////////////////////////////
				$scope.createProject = function($event) {
					if ($scope.changeApp($event, true) && $scope.changeAppSettings($event, true)) {
						$scope.submitDetails($event, false).then(function(validDetails) {
							if (validDetails) {
								showMask(true, "Creating Project");
								authStateService.authStatePromise.then(
									function (authState) {
										if (($scope.createNewAdminGroup &&
											($scope.selectedAdminUsers === undefined || $scope.selectedAdminUsers.length === 0)) ||
											(!$scope.createNewAdminGroup && ($scope.adminGroupId === undefined || $scope.adminGroupId === "" ||
											$scope.adminGroupId === null))) {
											showMask(false);
											$scope.error = "Please choose an admin group before continuing";
											return;
										}

										if (($scope.createNewUserGroup && ($scope.selectedUsers === undefined ||
											$scope.selectedUsers.length === 0)) ||
											(!$scope.createNewUserGroup && ($scope.userGroupId === undefined ||
											$scope.userGroupId === "" ||
											$scope.userGroupId === null))) {
											showMask(false);
											$scope.error = "Please choose a user group before continuing";
											return;
										}

										delete $scope.error;
										$scope.privilegesSubmitted = true;

										if ($scope.appSubmitted && $scope.appSettingsSubmitted && $scope.detailsSubmitted && $scope.privilegesSubmitted) {
											updateHeaderIcon("users");
											document.getElementById("btn-spec-project-save").disabled = true;
											showMask(true, "Creating project in all selected applications");

											if ($scope.adminGroupId !== null && $scope.adminGroupId !== undefined && $scope.adminGroupId !== "") {
												$scope.projectAdminUsernames = _.pluck($scope.adminUsersInGroup, 'name');
											} else {
												$scope.projectAdminUsernames = _.pluck($scope.selectedAdminUsers.undecoratedRows, 'name');
											}

											if ($scope.userGroupId !== null && $scope.userGroupId !== undefined && $scope.userGroupId !== "") {
												$scope.projectuserUsernames = _.pluck($scope.usersInGroup, 'name');
											} else {
												$scope.projectuserUsernames = _.pluck($scope.selectedUsers.undecoratedRows, 'name');
											}

											var selectedApps = getSelectedApps(false);
											Restangular.all("projects").post({
												name: $scope.name,
												key: $scope.key,
												description: "Spectrum Project",
												projectApplicationDetails: selectedApps,
												userGroup: $scope.projectuserUsernames,
												adminGroup: $scope.projectAdminUsernames
											}).then(
												function () {
													document.getElementById("btn-spec-project-save").disabled = false;
													showMask(false);
													$window.location = 'project.html#/projects?created=true';
												}, projectsModule.createErrorHandler($scope)
											);
										}
									}
								);
							}
						});
					}
				}
			}
		]);
})();
