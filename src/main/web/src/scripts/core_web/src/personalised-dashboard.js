var blankImage = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
(function () {
	"use strict";
	var personalisedDashboardModule = angular.module("personalisedDashboardModule", ["ui.router",
		"angularUtils.directives.uiBreadcrumbs",
		"spectrumLoginModule",
		"spectrumHeaderModule",
		"spectrumMenuModule",
		"spectrumHeadingModule",
		"spectrumFooterModule",
		"adf",
		"spectrumTableModule",
		"widgetRestTableModelModule",
		"spectrumArrayTableModelModule",
		"applicationTableModule",
		"minicolors",
		"spectrumWidgetCommonOptionsModule",
		"spectrumWidgetLoadingModule",
		"widgetRestCommentModelModule",
		"spectrumCommentsModule",
		"spectrumTaskTimerModule",
		"spectrumUtilitiesModule",
		"adf.widget.bookmark",
		"adf.widget.nexusPolicy",
		"ui.select"
	]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration of custom ADF templates
	///////////////////////////////////////////////////////////////////////////////////////////////////
	setupWidgetTweaks(angular);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration & Initialisation
	///////////////////////////////////////////////////////////////////////////////////////////////////
	personalisedDashboardModule
		.constant("MINICOLORS_SETTINGS", {theme: "bootstrap", position: "bottom right", letterCase: "uppercase"})
		.constant("TITLE_BAR_COLORS", {txtColor: "#FFFFFF", bgColor: "#374049"})
		.config(["$urlRouterProvider", "$stateProvider", "RestangularProvider", "dashboardProvider", "$provide", "$sceDelegateProvider",
			function ($urlRouterProvider, $stateProvider, RestangularProvider, dashboardProvider, $provide, $sceDelegateProvider) {
				setupDefaultRestangularUrlModifications(RestangularProvider);
				$urlRouterProvider.otherwise("/personalised-dashboard");
				$stateProvider.state("personalised-dashboard", {
					url: "/personalised-dashboard",
					templateUrl: "partials/personalised-dashboard.html",
					controller: "personalisedDashboardController",
					data: {
						displayName: 'Personalised Dashboard'
					}
				});

				dashboardProvider.widget("confluence-notifications", {
					title: "Notifications",
					description: "Up to date list of all your notifications directly from Confluence",
					templateUrl: "partials/widgets/confluence.html",
					controller: "confluenceNotificationController",
				});
				dashboardProvider.widget("confluence-tasks", {
					title: "Tasks",
					description: "Up to date list of all your tasks in from Confluence",
					templateUrl: "partials/widgets/confluence.html",
					controller: "confluenceTaskController",
				});
				dashboardProvider.widget("jira", {
					title: "Filter Results",
					description: "Results of a favourite filter from JIRA",
					templateUrl: "partials/widgets/jira.html",
					controller: "jiraController",
				});
				dashboardProvider.widget("jira-agile", {
					title: "Agile Boards",
					description: "Results of an Agile Board from JIRA",
					templateUrl: "partials/widgets/jira_agile.html",
					controller: "jiraAgileController",
				});
				dashboardProvider.widget("jira-sprint-monitor", {
					title: "Sprint Monitor",
					description: "Monitoring the progress of a JIRA sprint",
					templateUrl: "partials/widgets/jira_sprint_monitor.html",
					controller: "jiraSprintMonitorController",
				});
				dashboardProvider.widget("google-calendar", {
					title: "Calendar\t",
					class: "",
					colour: "",
					description: "Get updates from your google calendar",
					templateUrl: "partials/widgets/google_calendar.html",
					controller: "googleCalendarController",
				});
				dashboardProvider.widget("application-list", {
                    title: "Application List",
                    class: "",
                    colour: "",
                    description: "All applications added to Spectrum",
                    templateUrl: "partials/widgets/application_link.html",
                    controller: "applicationListController",
				});
				dashboardProvider.widget("nexus-evaluation-reports", {
					title: "Nexus Evaluation Reports",
					class: "",
					colour: "",
					description: "Latest Evaluation Reports from Nexus",
					templateUrl: "partials/widgets/nexusReport.html",
					controller: "nexusReportController",
				});

				dashboardProvider.structure("(1) Header with two columns", {
					iconUrl: "images/dashboard_layouts/Header_with_two_columns.png",
					rows: [{
						columns: [{
							styleClass: "col-md-12"
						}]
					}, {
						columns: [{
							styleClass: "col-md-6"
						}, {
							styleClass: "col-md-6"
						}]
					}]
				});
				dashboardProvider.structure("(2) Thin and thick columns", {
					iconUrl: "images/dashboard_layouts/Thin_and_thick_columns.png",
					rows: [{
						columns: [{
							styleClass: "col-md-3"
						}, {
							styleClass: "col-md-9"
						}]
					}]
				});
				dashboardProvider.structure("(3) Full page", {
					iconUrl: "images/dashboard_layouts/Full_page.png",
					rows: [{
						columns: [{
							styleClass: "col-md-12"
						}]
					}]
				});
				dashboardProvider.structure("(4) Two columns", {
					iconUrl: "images/dashboard_layouts/Two_columns.png",
					rows: [{
						columns: [{
							styleClass: "col-md-6"
						}, {
							styleClass: "col-md-6"
						}]
					}]
				});

				//Enable whitelist of google for use in embedded iframes
				$sceDelegateProvider.resourceUrlWhitelist([
					'self', // Allow same origin resource loads.
					'https://*.google.com/**'
				]);
			}
		])
		.createErrorHandler = spectrumRestangularErrorHandler;

	personalisedDashboardModule.factory("getAppsOfType", ["$rootScope", "Restangular", function ($rootScope, Restangular) {
		var promise = Restangular.all("application/installed-application").getList().then(function (installedApps) {
			return Restangular.all("application/supported-application").getList().then(
				function (supportedApps) {
					var installedAppsDict = {};
					angular.forEach(installedApps, function (app) {
						var appType = _.result(_.find(supportedApps, {
							"id": app.supportedAppId
						}), "name");
						app.type = appType;
						if (app.linkConfigured) {
							installedAppsDict[app.id] = app;
						}
					});
					return installedAppsDict;
				}
			);
		});
		return function (appType) {
			return promise.then(function(installedAppsDict) {
				if (appType === null || appType === undefined) {
					return installedAppsDict;
				}
				return _.filter(installedAppsDict, {
					"type": appType
				});
			});
		};
	}]);

	personalisedDashboardModule.filter('propsFilter', function() {
      return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
          var keys = Object.keys(props);

          items.forEach(function(item) {
            var itemMatches = false;

            for (var i = 0; i < keys.length; i++) {
              var prop = keys[i];
              var text = props[prop].toLowerCase();
              if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                itemMatches = true;
                break;
              }
            }

            if (itemMatches) {
              out.push(item);
            }
          });
        } else {
          // Let the output be the input untouched
          out = items;
        }

        return out;
      };
    });

	personalisedDashboardModule.factory("listApplicationLinks", ["$rootScope", "Restangular", function ($rootScope, Restangular) {
		var applicationLinks;
		return function (appType, appId) {
			if (applicationLinks === undefined) {
				if (appType && appId) {
					applicationLinks = [];

					Restangular.all("message").post({
						type: appType,
						method: "listApplicationLinks",
						appId: appId
					})
					.then(function (message) {
						var results = JSON.parse(message.payload);
						if (results) {
							applicationLinks = results.list;
						}

						$rootScope.$broadcast("listApplicationLinksChanged");
					});
				}
			}

			return applicationLinks;
		};
	}]);

	personalisedDashboardModule.factory("saveWidgetConfig", ["Restangular", function (Restangular) {
		return function ($scope, callback) {

			function showSaveIcon(show) {
				if (show) {
					$(".adf_save").fadeIn("slow", function () {
						$(".adf_spinner").css({
							"color": "#E25C46"
						});
					});
				} else {
					$(".adf_save").fadeOut("slow"),
						function () {
							$(".adf_spinner").css({
								"color": "#66BE61"
							});
						};
				}
			}

			if ($scope.widget.id) {
				showSaveIcon(true);

				Restangular.one("dashboard", $scope.widget.dashboardId).one("widget", $scope.widget.id)
					.customPUT({
						config: $scope.widget.config,
						title: $scope.widget.title,
						autoRefresh: $scope.widget.autoRefresh,
						bgColor: $scope.widget.bgColor,
						txtColor: $scope.widget.txtColor,
						type: $scope.widget.type
				}).then(
					function (message) {
						showSaveIcon(false);
						showMask(false);
						if (callback !== undefined) {
							callback();
						}
					}, function() {
						showMask(false);
					}
				);
			} else {
				showMask(false);
			}

		};
	}]);

	personalisedDashboardModule.controller("confluenceNotificationController", ["$scope", "$q", "widget", "Restangular", "getAppsOfType",
		"listApplicationLinks", "arrayTableModelService", "saveWidgetConfig", "MINICOLORS_SETTINGS", "TITLE_BAR_COLORS",
		function ($scope, $q, widget, Restangular, getAppsOfType, listApplicationLinks, arrayTableModelService, saveWidgetConfig, MINICOLORS_SETTINGS, TITLE_BAR_COLORS) {
			$scope.appType = "Confluence";
			$scope.ready = false;
			$scope.resultTable = {};

            $scope.widget = widget;
            toggleWidgetResize($scope.widget);
            $scope.widget.searchBox = filterWidget;
            $scope.data = _.extend({
                method: 'notifications',
                enableDone: $scope.widget.config.enableDone
            }, getStandardWidgetData($scope, MINICOLORS_SETTINGS, TITLE_BAR_COLORS));

			$scope.$watch("resultTable.updateInProgress", function (newVal, oldVal) {
				if (oldVal && !newVal) {
					$scope.ready = true;
				}
			});
			$scope.$watch("data.titleBgColor", function (newVal, oldVal) {
                $scope.widget.bgColor = newVal;
			});
			$scope.$watch("data.titleTxtColor", function (newVal, oldVal) {
                $scope.widget.txtColor = newVal;
			});

			$scope.update = function (withSave) {
				if($scope.data.chosenApp === undefined || $scope.data.chosenApp === null) {
					$scope.ready = true;
					return;
				}
				$scope.ready = false;
                $scope.widget.config.enableDone = $scope.data.enableDone;

				if (withSave !== undefined && withSave) {
                    $scope.widget.config.chosenApp = $scope.data.chosenApp.id;
					saveWidgetConfig($scope);
				}
				$scope.data.appUrl = $scope.data.chosenApp.url;
				$scope.resultTable = {};
				Restangular.all("message").post({
						type: $scope.appType.toLowerCase(),
						method: 'notifications',
						appId: $scope.data.chosenApp.id
					})
					.then(function (message) {
						var results;
						try {
							results = JSON.parse(message.payload);
						} catch(err) {
							results = [];
							console.error(err);
						}
						$scope.resultTable = arrayTableModelService.createArrayTableModel(
							results,
							function (rowItem) {
								rowItem.prettyDetails = rowItem.title;
								rowItem.page = rowItem.item.title;
								rowItem.time = jQuery.timeago(rowItem.created);
								var rowItemUrl;
								var appId = $scope.data.chosenApp.id;
								if (rowItem.applicationLinkId) {
									var app = getAppForAtlassianLinkId($scope, listApplicationLinks, Restangular, rowItem.applicationLinkId, true);
									rowItemUrl = (app && app.url) ? app.url + rowItem.item.url : "#";
									appId = app && app.id;
								} else {
									rowItemUrl = $scope.data.appUrl + rowItem.item.url;
								}
								if (appId) {
									var pageId;
									if (rowItem.action == "task.assign") {
										var match = (/contentId=([^&]*)&/ig).exec(rowItem.globalId);
										if (match) {
											pageId = match[1];
										}
									} else {
										pageId = rowItem.metadata.pageId;
									}
									if (pageId) {
										rowItem.preview = {
											title: "Confluence Page Preview",
											content: function() {
												return Restangular.one("application/" + appId + "/confluence/page/" + pageId + "/preview").get();
											}
										};
									}
								}
								return {
									data: rowItem,
									actions: [],
									url: rowItemUrl,
									defaultAction: [],
									external: true
								}
							}, true, ["time", "page", "prettyDetails"]);
				}, personalisedDashboardModule.createErrorHandler($scope));
			};

			$scope.saveOptions = function(form) {
				$scope.config.chosenApp = $scope.data.chosenApp.id;
				standardSaveOptions($scope, saveWidgetConfig, form.$valid);
			};
			setupWidgetOptionFunctions($scope);
			setUpOnApplicationLinksAvailableChange($scope, listApplicationLinks, $scope.update);

			var getInstalledApplications = function() {
				return getAppsOfType().then(function(installedApps) {
					$scope.data.installedApps = installedApps
				});
			};

			getApplications($scope, getAppsOfType, $q).then(getInstalledApplications).then($scope.update);
			/*Remove this is just hack as i am too lazy to connect jira*/
            $scope.data.boardList = [{"name":"Card board","self":"http://localhost:9876/jira/rest/agile/1.0/board/1","id":1,"type":"scrum"},{"name":"Black board","self":"http://localhost:9876/jira/rest/agile/1.0/board/2","id":2,"type":"kanban"},{"name":"Snow board","self":"http://localhost:9876/jira/rest/agile/1.0/board/3","id":3,"type":"scrum"}];

		}
	]);

	personalisedDashboardModule.controller("confluenceTaskController", ["$scope", "$q", "widget", "Restangular", "getAppsOfType",
		"listApplicationLinks", "arrayTableModelService", "saveWidgetConfig", "MINICOLORS_SETTINGS", "TITLE_BAR_COLORS",
		function ($scope, $q, widget, Restangular, getAppsOfType, listApplicationLinks, arrayTableModelService,
			saveWidgetConfig, MINICOLORS_SETTINGS, TITLE_BAR_COLORS) {
			$scope.appType = "Confluence";
			$scope.ready = false;
			$scope.resultTable = {};

            $scope.widget = widget;
            toggleWidgetResize($scope.widget);

            $scope.data = _.extend({
                            method: 'tasks',
                            enableDone: $scope.widget.config.enableDone
                        }, getStandardWidgetData($scope, MINICOLORS_SETTINGS, TITLE_BAR_COLORS));

			$scope.$watch("resultTable.updateInProgress", function (newVal, oldVal) {
				if (oldVal && !newVal) {
					$scope.ready = true;
				}
			});
			$scope.$watch("data.titleBgColor", function (newVal, oldVal) {
                $scope.widget.bgColor = newVal;
			});
			$scope.$watch("data.titleTxtColor", function (newVal, oldVal) {
                $scope.widget.txtColor = newVal;
			});

			$scope.update = function (withSave) {
				if ($scope.data.chosenApp !== undefined && $scope.data.chosenApp !== null) {
					$scope.ready = false;
					$scope.widget.config.enableDone = $scope.data.enableDone;

					if (withSave !== undefined && withSave) {
                        $scope.widget.config.chosenApp = $scope.data.chosenApp.id;
						saveWidgetConfig($scope);
					}
					$scope.data.appUrl = $scope.data.chosenApp.url;
					$scope.resultTable = {};
					Restangular.all("task/confluence/" + $scope.data.chosenApp.id).getList({
						showDone: $scope.widget.config.enableDone
					})
					.then(function (results) {
						$scope.resultTable = arrayTableModelService.createArrayTableModel(
								results,
								function (rowItem) {
									rowItem.prettyDetails = rowItem.description;
									rowItem.prettyTitle = rowItem.pageTitle;
									if (rowItem.remoteId.contentId) {
										rowItem.preview = {
											title: "Confluence Page Preview",
											content: function() {
												return Restangular.one("application/" + $scope.data.chosenApp.id + "/confluence/page/" + rowItem.remoteId.contentId + "/preview").get();
											}
										};
									}
									return {
										data: rowItem,
										actions: [],
										url: $scope.data.appUrl + rowItem.url,
										defaultAction: [],
										external: true,
										checked: rowItem.status === 'DONE',
										updateTaskCallback: updateTask
									};
								}, true, ["prettyTitle", "prettyDetails"]);
					}, personalisedDashboardModule.createErrorHandler($scope));
				} else {
					$scope.ready = true;
				}
			};

			$scope.saveOptions = function(form) {
				$scope.config.chosenApp = $scope.data.chosenApp.id;
				standardSaveOptions($scope, saveWidgetConfig, form.$valid);
			};
			setupWidgetOptionFunctions($scope);
			setUpOnApplicationLinksAvailableChange($scope, listApplicationLinks, $scope.update);

			var getInstalledApplications = function() {
				return getAppsOfType().then(function(installedApps) {
					$scope.data.installedApps = installedApps
				});
			};

			var updateTask = function(taskData){
				var updateTask = Restangular.one('task/confluence/' + $scope.data.chosenApp.id + '/' + taskData.remoteId.taskId);
				updateTask.status = taskData.status === 'DONE' ? 'TODO' : 'DONE';
				updateTask.remoteId = taskData.remoteId;
				updateTask.put().then(function() {
				}, function(error) {
					bootbox.alert('Sorry, an error occurred while updating task');
					$scope.update();
				});
			};

			getApplications($scope, getAppsOfType, $q).then(getInstalledApplications).then($scope.update);
		}
	]);

	personalisedDashboardModule.controller("jiraAgileController", ["$scope", "$q", "widget", "Restangular", "getAppsOfType",
		"arrayTableModelService", "saveWidgetConfig", "taskTimer", "MINICOLORS_SETTINGS", "TITLE_BAR_COLORS",
		"widgetCommentService",
		function ($scope, $q, widget, Restangular, getAppsOfType, arrayTableModelService, saveWidgetConfig, taskTimer,
		MINICOLORS_SETTINGS, TITLE_BAR_COLORS, widgetCommentService) {
			$scope.appType = "JIRA";
			$scope.ready = false;
			$scope.resultTable = {};

			var actionObjects = [{
					name: "Comments",
					icon: "comment",
					class: "default",
					run: function (data) {
					 getJiraAgileComments (data);
				}},
				{
					name: "Record time",
					icon: "adjust",
					class: "default",
					run: function(data) {
						taskTimer.start($scope.data.chosenApp, data.key);
					}
				}];

				var getJiraAgileComments = function(data){
					$scope.comments = widgetCommentService.getCommentsModel($scope.data.chosenApp.id, data.key, $scope.appType);
					$scope.comments.issueTitle = data.name;
					$scope.comments.issueKey = data.key;
					widgetCommentService.showModal($scope.comments, $scope.widget);
				};

            $scope.widget = widget;
            toggleWidgetResize($scope.widget);
            $scope.widget.searchBox = filterWidget;
			$scope.data = getStandardWidgetData($scope, MINICOLORS_SETTINGS, TITLE_BAR_COLORS);
			$scope.$watch("resultTable.updateInProgress", function (newVal, oldVal) {
				if (oldVal && !newVal) {
					$scope.ready = true;
				}
			});

			$scope.$watch("data.titleBgColor", function (newVal, oldVal) {
                $scope.widget.bgColor = newVal;
			});
			$scope.$watch("data.titleTxtColor", function (newVal, oldVal) {
                $scope.widget.txtColor = newVal;
			});

			$scope.update = function (withSave) {
				if ($scope.data.chosenApp !== undefined && $scope.data.chosenApp !== null) {
					$scope.ready = false;
                    $scope.widget.config.chosenApp = $scope.data.chosenApp.id;
					if ($scope.data.chosenBoard !== undefined && $scope.data.chosenBoard !== null) {
                        $scope.widget.config.boardId = $scope.data.chosenBoard.id;
                        $scope.widget.config.boardType = $scope.data.chosenBoard.type;
					}
					if ($scope.data.chosenColumn !== undefined && $scope.data.chosenColumn !== null) {
                        $scope.widget.config.filterOn = $scope.data.chosenColumn.name;
					}
					if (withSave !== undefined && withSave) {
						saveWidgetConfig($scope);
					}
					$scope.data.appUrl = $scope.data.chosenApp.url;
					var payload = {
						boardId: $scope.widget.config.boardId,
						boardType: $scope.widget.config.boardType
					};
					if ($scope.data.chosenColumn !== undefined && $scope.data.chosenColumn !== null &&
						$scope.data.chosenColumn.isAllColumns === undefined) {
						payload.boardColumn = $scope.data.chosenColumn.name;
					}
					Restangular.all("message").post({
							type: $scope.appType.toLowerCase(),
							method: "getIssuesForAgileBoard",
							appId: $scope.widget.config.chosenApp,
							payload: payload
						})
						.then(
							function (message) {
								var results = JSON.parse(message.payload);
								var issues = [];
								if (results.issues !== undefined) {
									issues = results.issues;
								}
								$scope.resultTable = arrayTableModelService.createArrayTableModel(
									issues,
									function (rowItem) {
										return {
											data: convertJiraIssueRow(rowItem),
											actions: actionObjects,
											url: $scope.data.appUrl + "/browse/" + rowItem.key,
											defaultAction: [],
											external: true
										};
									}, false, ["key", "name", "status", "project"]
								);

							}, personalisedDashboardModule.createErrorHandler($scope)
						);
				} else {
					$scope.ready = true;
				}
			};

			$scope.getBoardList = function (withSave) {
				$scope.ready = false;
				$scope.data.boardList = [];
				$scope.data.boardColumns = [];
				$scope.resultTable.rows = [];
				standardMessageCall(Restangular, $scope, "getAgileBoardList", null, function (response) {
					standardMessageCallback(response, $scope, $scope.widget.config.boardId, "boardList", "chosenBoard", "values");
					$scope.getColumnList(withSave);
				}, function () {
					$scope.getColumnList(withSave);
				});
			};

			$scope.getColumnList = function (withSave) {
				$scope.ready = false;
				$scope.data.boardColumns = [];
				$scope.resultTable.rows = [];
				if ($scope.data.chosenBoard !== undefined && $scope.data.chosenBoard !== null) {
					standardMessageCall(Restangular, $scope, "getAgileBoardColumns", {
						boardId: $scope.data.chosenBoard.id
					}, function (response) {
						standardMessageCallback(response, $scope, $scope.widget.config.chosenColumn, "boardColumns", "chosenColumn", "columnConfig",
							"columns");
						$scope.data.boardColumns.splice(0, 0, {
							name: "-- All columns --",
							isAllColumns: true
						});
						//Have to double check afterwards due to "all columns" not being a column
						if ($scope.data.chosenColumn === null || $scope.widget.config.chosenColumn === "-- All columns --") {
							$scope.data.chosenColumn = $scope.data.boardColumns[0];
						}
						$scope.update(withSave);
					});
				} else {
					$scope.update(withSave);
				}
			};

			$scope.saveOptions = function(form) {
				$scope.config.chosenApp = $scope.data.chosenApp.id;
				$scope.config.chosenBoard = $scope.data.chosenBoard.id;
				$scope.config.chosenColumn = $scope.data.chosenColumn.name;

				standardSaveOptions($scope, saveWidgetConfig, form.$valid);
			};
			setupWidgetOptionFunctions($scope);
			getApplications($scope, getAppsOfType, $q).then($scope.getBoardList);
		}
	]);

	personalisedDashboardModule.controller("jiraSprintMonitorController", ["$scope", "$q", "widget", "Restangular", "getAppsOfType",
		"arrayTableModelService", "saveWidgetConfig", "taskTimer", "MINICOLORS_SETTINGS", "TITLE_BAR_COLORS",
		function ($scope, $q, widget, Restangular, getAppsOfType, arrayTableModelService, saveWidgetConfig, taskTimer,
		MINICOLORS_SETTINGS, TITLE_BAR_COLORS) {
			$scope.appType = "JIRA";
			$scope.ready = false;
			$scope.resultTable = {};

            $scope.widget = widget;
            toggleWidgetResize($scope.widget);
            $scope.data = _.extend({
                            sprintList: []
                        }, getStandardWidgetData($scope, MINICOLORS_SETTINGS, TITLE_BAR_COLORS));

			$scope.sprintData = {
				excludeInProgress: false
			};

			$scope.$watch("resultTable.updateInProgress", function (newVal, oldVal) {
				if (oldVal && !newVal) {
					$scope.ready = true
				}
			});

			$scope.$watch("data.titleBgColor", function (newVal, oldVal) {
                $scope.widget.bgColor = newVal;
			});
			$scope.$watch("data.titleTxtColor", function (newVal, oldVal) {
                $scope.widget.txtColor = newVal;
			});

			$scope.update = function (withSave) {
				if ($scope.data.chosenApp !== undefined && $scope.data.chosenApp !== null &&
						$scope.data.chosenSprint !== undefined && $scope.data.chosenSprint !== null){
					$scope.ready = false;
                    $scope.widget.config.chosenApp = $scope.data.chosenApp.id;
					if ($scope.data.chosenSprint !== undefined && $scope.data.chosenSprint !== null) {
                        $scope.widget.config.sprintId = $scope.data.chosenSprint.id;
                        $scope.widget.config.boardName = $scope.data.chosenSprint.boardName;
                        $scope.widget.config.appId = $scope.data.chosenApp.id;
					}
					if (withSave !== undefined && withSave) {
						saveWidgetConfig($scope);
					}
					$scope.data.appUrl = $scope.data.chosenApp.url;

					Restangular.one("application", $scope.data.chosenApp.id).one("jira")
							   .one("sprint", $scope.data.chosenSprint.id)
							   .get({boardName: $scope.data.chosenSprint.boardName})
					.then(
						function (sprint) {
							$scope.generateSprintData(sprint);
							$scope.ready = true;
						}, function() {
							$scope.ready = true;
						}
					);
				} else {
					$scope.ready = true;
				}
			};

			$scope.getBoardSprintList = function (withSave) {
				$scope.ready = false;
				$scope.data.sprintData = {};
				$scope.data.sprintList = [];
				$scope.resultTable.rows = [];

				Restangular.one("application", $scope.data.chosenApp.id).one("jira").getList("sprint")
				.then(
					function (sprints) {
						for (var i = 0; i < sprints.length; i++) {
							$scope.data.sprintList.push({
								id: sprints[i].id,
								sprintName: sprints[i].name,
								boardId: sprints[i].boardId,
								boardName: sprints[i].boardName,
								name: sprints[i].boardName + " - " + sprints[i].name
							});
						}
						if ($scope.config.sprintId !== undefined) {
							$scope.data.chosenSprint = _.find($scope.data.sprintList, {"id": $scope.widget.config.sprintId, "boardName":  $scope.widget.config.boardName});
						}
						if ($scope.data.chosenSprint === undefined && $scope.data.sprintList.length > 0) {
							$scope.data.chosenSprint = $scope.data.sprintList[0];
						}

						$scope.update(withSave);
						$scope.ready = true;
					}, function() {
						$scope.ready = true;
					}
				);
			};

			$scope.getSprintData = function (withSave) {

				if ($scope.data.chosenSprint !== undefined && $scope.data.chosenSprint !== null) {
					$scope.ready = false;
					if (withSave) {
                        $scope.widget.config.sprintId = $scope.data.chosenSprint.id;
                        $scope.widget.config.boardName = $scope.data.chosenSprint.boardName;
					}

					Restangular.one("application", $scope.data.chosenApp.id).one("jira")
							   .one("sprint", $scope.data.chosenSprint.id)
							   .get({boardName: $scope.data.chosenSprint.boardName})
					.then(
						function (sprint) {
							$scope.generateSprintData(sprint);
							$scope.ready = true;
						}, function() {
							$scope.ready = true;
						}
					);

				} else {
					$scope.update(withSave);
				}
			};

			$scope.onHoverSprintSection = function(sectionId) {
				function updateTableX() {
					try {
						$scope.$apply();
					} catch(e) {
						//Apply is already in progress, we can wait
					}
					$scope.tableIssues = $("#issues-" + $scope.widget.wid).html();
					var popover = $("#bar-" + sectionId + "-" + $scope.widget.wid).attr('data-content', $scope.tableIssues).data('bs.popover');
					popover.setContent();
					popover.$tip.addClass(popover.options.placement);
				}

				Restangular.one("application", $scope.data.chosenApp.id).one("jira")
						   .one("sprint", $scope.data.chosenSprint.id).one("issue")
						   .get({status: sectionId})
				.then(
					function (issues) {
						$scope.issuePopupTable = arrayTableModelService.createArrayTableModel(
							generateIconObjects(issues),
							function (rowItem) {
								return {
									data: rowItem,
									url: $scope.data.appUrl + "/browse/" + rowItem.key,
									defaultAction: [],
									external: true
								};
							}, false, undefined, undefined, updateTableX
						);
					}
				);
			};

			function generateIconObjects(issues) {
				var key = "";
				for (var i = 0; i < issues.length; i++) {
					key = Object.keys(issues[i].icon)[0];
					issues[i].icon = {alt: key, src:  issues[i].icon[key]};
				}
				return issues;
			}

			$scope.generateSprintData = function(sprint) {
				if (sprint) {
					$scope.sprintData.remainingDays = sprint.remainingDays;
					$scope.sprintData.totalDays = sprint.totalDays;
					$scope.sprintData.currentDay = sprint.totalDays - sprint.remainingDays;
					$scope.sprintData.inProgressEstimate = sprint.inProgressEstimate

					$scope.sprintData.percentComplete = ((sprint.totalDays - sprint.remainingDays) / sprint.totalDays) * 100;

					if ($scope.sprintData.excludeInProgress) {
						sprint.todoEstimate += sprint.inProgressEstimate;
						sprint.inProgressEstimate = 0;
					}

					$scope.sprintData.totalEstimate = sprint.todoEstimate + sprint.inProgressEstimate + sprint.doneEstimate;

					$scope.sprintData.todoPercent = (sprint.todoEstimate / $scope.sprintData.totalEstimate) * 100;
					$scope.sprintData.inProgressPercent = (sprint.inProgressEstimate / $scope.sprintData.totalEstimate) * 100;

					if (isNaN($scope.sprintData.todoPercent) && isNaN($scope.sprintData.inProgressPercent)) {
						$scope.sprintData.todoPercent = 0;
						$scope.sprintData.inProgressPercent = 0;
						$scope.sprintData.donePercent = 100;
					} else {
						$scope.sprintData.donePercent = (sprint.doneEstimate / $scope.sprintData.totalEstimate) * 100;
					}
					$scope.sprintData.sprintVariance = 0;
					if($scope.sprintData.percentComplete > 0){
						$scope.sprintData.sprintVariance = (($scope.sprintData.donePercent / $scope.sprintData.percentComplete) - 1) * 100;
					}

					$scope.sprintData.varianceColour = colourBand($scope.sprintData.sprintVariance);


					$scope.tableIssues = $("#issues-" + $scope.widget.wid).html();

					var statuses = ["done", "inprogress", "notstarted"];

					for (var i = 0; i < statuses.length; i++) {
						$("#bar-" + statuses[i] + "-" + $scope.widget.wid).popover("destroy");
						$("#bar-" + statuses[i] + "-" + $scope.widget.wid).popover({
							trigger: "manual",
							html: true,
							container: 'body',
							content: function() {
								return $scope.tableIssues;
							}
						}).on("mouseenter", function () {
							var _this = this;
							$(this).popover("show");
							$(".popover").on("mouseleave", function () {
								$(_this).popover('hide');
							});
						}).on("mouseleave", function () {
							var _this = this;
							setTimeout(function () {
								if (!$(".popover:hover").length) {
									$(_this).popover("hide");
								}
						  }, 100);
						});
					}
				}

			};

			function colourBand(variation){
				if (variation >= 0) {
					return '5cb85c';
				} else {
					return 'd9534f';
				}

			}

			$scope.saveOptions = function(form) {
				if (form.$valid) {
					$scope.config.chosenApp = $scope.data.chosenApp.id;
					$scope.config.chosenSprint = $scope.data.chosenSprint.id;
				}
				standardSaveOptions($scope, saveWidgetConfig, form.$valid);
			};
			setupWidgetOptionFunctions($scope);
			getApplications($scope, getAppsOfType, $q).then($scope.getBoardSprintList);
		}
	]);

	personalisedDashboardModule.controller("jiraController", ["$scope", "$q", "widget", "Restangular", "getAppsOfType",
		"jiraRestTableModelService", "saveWidgetConfig", "MINICOLORS_SETTINGS", "TITLE_BAR_COLORS",	"widgetCommentService", "taskTimer",
		function ($scope, $q, widget, Restangular, getAppsOfType, jiraRestTableModelService, saveWidgetConfig
		, MINICOLORS_SETTINGS, TITLE_BAR_COLORS, widgetCommentService, taskTimer) {
			$scope.appType = "JIRA";
			 var actionObjects = [{
								name: "Comments",
								icon: "comment",
								class: "default",
								run: function (data) {
									getJiraFilterComments(data);
								}
				} ,{
					name: "Record time",
					icon: "adjust",
					class: "default",
					run: function(data) {
						taskTimer.start($scope.data.chosenApp, data.key);
					}
			}];

			var getJiraFilterComments = function(data){
				$scope.comments = widgetCommentService.getCommentsModel($scope.data.chosenApp.id, data.key, $scope.appType, $scope.data.appUrl);
				$scope.comments.issueTitle = data.name;
				$scope.comments.issueKey = data.key;
				widgetCommentService.showModal($scope.comments, $scope.widget);
			};

			$scope.ready = false;
			$scope.resultTable = {};

            $scope.widget = widget;
            toggleWidgetResize($scope.widget);
            $scope.widget.searchBox = filterWidget;
			$scope.data = getStandardWidgetData($scope, MINICOLORS_SETTINGS, TITLE_BAR_COLORS);

			$scope.$watch("resultTable.updateInProgress", function (newVal, oldVal) {
				if (oldVal && !newVal) {
					$scope.ready = true;
				}
			});

			$scope.$watch("data.titleBgColor", function (newVal, oldVal) {
                $scope.widget.bgColor = newVal;
			});
			$scope.$watch("data.titleTxtColor", function (newVal, oldVal) {
                $scope.widget.txtColor = newVal;
			});

			$scope.update = function (withSave) {
				if ($scope.data.chosenApp !== undefined && $scope.data.chosenApp !== null) {
					$scope.ready = false;
                    $scope.widget.config.chosenApp = $scope.data.chosenApp.id;
					if ($scope.data.chosenFilter !== undefined && $scope.data.chosenFilter !== null) {
                        $scope.widget.config.filterId = $scope.data.chosenFilter.id;
					}
					if (withSave !== undefined && withSave) {
						saveWidgetConfig($scope);
					}
					$scope.data.appUrl = $scope.data.chosenApp.url;

					if($scope.widget.config.filterId) {
						$scope.resultTable = jiraRestTableModelService.createRestTableModel(
							{type: $scope.appType.toLowerCase(), id: $scope.data.chosenApp.id, url: $scope.data.appUrl},
                            $scope.widget, false, actionObjects
						);
					} else {
						$scope.ready = true;
					}
					if (_.isEmpty($scope.resultTable)) {
						$('#widget-filter-' + $scope.widget.wid).popover("destroy");
					} else {
						$('#widget-filter-' + $scope.widget.wid).popover({
							container: "body",
							content: "Search on <b>name</b> or <b>description</b>",
							placement: "top",
							trigger: "focus",
							html: true
						});
					}
				}
			};

			$scope.getFilterList = function (withSave) {
				$scope.ready = false;
				$scope.data.favouriteFilters = [];
				$scope.data.chosenFilter = null;
				$scope.resultTable.rows = [];

				standardMessageCall(Restangular, $scope, "getFilters", null, function (response) {
					standardMessageCallback(response, $scope, $scope.widget.config.filterId, "favouriteFilters", "chosenFilter");
					if ($scope.data.favouriteFilters.length === 0) {
						delete $scope.widget.config.filterId;
					}
					$scope.update(withSave);
				});
			};

			$scope.saveOptions = function(form) {
				$scope.ready = false;
				$scope.config.chosenApp = $scope.data.chosenApp.id;
				$scope.config.chosenFilter = $scope.data.chosenFilter.id;
				standardSaveOptions($scope, saveWidgetConfig, form.$valid);
			};
			setupWidgetOptionFunctions($scope);
			getApplications($scope, getAppsOfType, $q).then($scope.getFilterList);
		}
	]);

	personalisedDashboardModule.controller("googleCalendarController", ["$scope", "widget", "Restangular", "getAppsOfType",
		"arrayTableModelService", "saveWidgetConfig", "MINICOLORS_SETTINGS", "TITLE_BAR_COLORS",
		function ($scope, widget, Restangular, getAppsOfType, arrayTableModelService, saveWidgetConfig, MINICOLORS_SETTINGS, TITLE_BAR_COLORS) {
			$scope.ready = false;
			$scope.resultTable = {};

            $scope.widget = widget;
            toggleWidgetResize($scope.widget);
            $scope.data = _.extend({
                            authorized: false,
                            googleAuthorisationUrl: "",
                            showCalender: false,
                            iframesrc: "",
                            availableTypes: [{ name: "Table", value: "table" }, { name: "Grid", value: "grid" }]
                        }, getStandardWidgetData($scope, MINICOLORS_SETTINGS, TITLE_BAR_COLORS));

			$scope.$watch("resultTable.updateInProgress", function (newVal, oldVal) {
				if (oldVal && !newVal) {
					$scope.ready = true;
				}
			});

			$scope.$watch("data.titleBgColor", function (newVal, oldVal) {
                $scope.widget.bgColor = newVal;
			});
			$scope.$watch("data.titleTxtColor", function (newVal, oldVal) {
                $scope.widget.txtColor = newVal;
			});

			$scope.authorize = function() {
				angular.element(".dashboard").scope().toggleEditMode();
				window.location.href = $scope.data.googleAuthorisationUrl;
			};

			$scope.deauthorize = function () {
				$scope.ready = false;
				Restangular.all("message").post({
					type: "google-calendar",
					method: "deauthorize",
					appId: null
				}).then(
					function () {
						$scope.widget.title = "Calendar\t";
						$scope.data.windowTitle="Calendar\t";
						standardSaveOptions($scope, saveWidgetConfig, true);
						$scope.data.authorized = false;
						$scope.update(true);
					},
					function() {
						$scope.ready = true;
					});
			};

			$scope.getFilterList = function (withSave) {
				$scope.ready = false;
				$scope.data.timeFilters = [];
				$scope.data.chosenTimeFilter = {};
				$scope.resultTable.rows = [];
				$scope.appType = "google-calendar";
				standardMessageCall(Restangular, $scope, "eventOptions", null , function (response) {
					standardMessageCallback(response, $scope, $scope.widget.config.timeFilterId, "timeFilters", "chosenTimeFilter");
					$scope.data.chosenTimeFilter = _.find($scope.data.timeFilter, { "value": $scope.widget.config.timeFilterId });
					$scope.data.chosenType = _.find($scope.data.availableTypes, { "value": $scope.widget.config.chosenType });
					if ($scope.data.chosenType === undefined) {
						$scope.data.chosenType = $scope.data.availableTypes[0];
					}
					$scope.update(withSave);
				});
			};

			$scope.update = function (withSave) {
				$scope.ready = false;
				if ($scope.data.chosenTimeFilter !== undefined && $scope.data.chosenTimeFilter !== null) {
                    $scope.widget.config.timeFilterId = $scope.data.chosenTimeFilter.value;
				}
				$scope.data.showCalender = false;
				if ($scope.data.chosenType !== undefined && $scope.data.chosenType !== null) {
                    $scope.widget.config.chosenType = $scope.data.chosenType.value;
					if ($scope.widget.config.chosenType == "grid") {
						$scope.data.showCalender = true;
					}
				}

				if (withSave !== undefined && withSave) {
					saveWidgetConfig($scope);
				}

				Restangular.all("message").post({
						type: "google-calendar",
						method: "getData",
						appId: null,
						payload: $scope.widget.config
					})
					.then(
						function (message) {
							var results = JSON.parse(message.payload);
							$scope.data.chosenTimeFilter = _.find($scope.data.timeFilters, { "value": $scope.widget.config.timeFilterId });
							if (!$scope.widget.config.timeFilterId && $scope.data.timeFilters.length > 0) {
								$scope.data.chosenTimeFilter = $scope.data.timeFilters[0];
							}
							$scope.data.authorized = results.hasOwnProperty("credential") ? results.credential : results.hasOwnProperty("eventList");
							if (!$scope.data.authorized) {
								Restangular.one("google/authorisation-url").get().then(function (url) {
                                    $scope.widget.title = "Calendar\t";
									$scope.data.googleAuthorisationUrl = url;
									$scope.ready = true;
								}, function() { $scope.ready = true });
							} else {
								if ($scope.$parent.$parent.definition.title === "Calendar\t") {
                                    $scope.widget.title = $scope.data.windowTitle = ("Calendar - " + results.eventList.summary).substring(0, 60);
								}
								var primaryCalendar = _.find(results.calendarList.items, { primary: true });
								if (primaryCalendar === undefined) {
									primaryCalendar = results.calendarList.items[0];
								}
								$scope.data.iframesrc = "https://calendar.google.com/calendar/embed?bgcolor=%23F5F5F5&src=" + primaryCalendar.id;
								if ($scope.widget.config.timeFilterId !== "30_days") {
									$scope.data.iframesrc += "&mode=WEEK";
								}

								$scope.resultTable = arrayTableModelService.createArrayTableModel(
									results.eventList.items,
									function (rowItem) {
										if (rowItem.location === undefined) {
											rowItem.location = "Undefined";
										}
										rowItem = sanitizeEventDateTime(rowItem, results.settings);
										rowItem.event = (rowItem.summary != undefined ? rowItem.summary : "Untitled event");
										rowItem.details = rowItem.description;

										var startInMilli;
										if(rowItem.start.dateTime !== undefined){
											startInMilli = moment(rowItem.start.dateTime).valueOf();
										}else{
											startInMilli = moment(rowItem.start.date).valueOf();
										}
										rowItem.time = startInMilli;

										function sanitizeResponse(response) {
											//this wording is from marketings diagram it needs work
											if (response.length > 0) {
												response = response[0].toUpperCase() + response.substring(1);
											}
											if (response == "NeedsAction") {
												response = "Awaiting Response";
											}
											return response;
										}
										var attending = "N/A";

										if (rowItem.organizer.self !== undefined && rowItem.organizer.self === true) {
											attending = "Organizer";
										} else {
											var index, len;
											var attendees = rowItem.attendees;
											for (index = 0, len = attendees.length; index < len; ++index) {
												if (attendees[index].self !== undefined) {
													attending = sanitizeResponse(attendees[index].responseStatus);
												}
											}
										}
										rowItem.attending = attending;

										return {
											data: rowItem,
											actions: [],
											url: rowItem.htmlLink,
											defaultAction: [],
											external: true
										};
									}, false, ["date", "time", "event", "details", "location", "attending"]
								);
							}
						}, personalisedDashboardModule.createErrorHandler($scope)
					);
			};
			$scope.getFilterList(false);

			$scope.saveOptions = function(form) {
				if (form.$valid) {
					$scope.config.timeFilterId = $scope.data.chosenTimeFilter.value;
                    $scope.widget.title = $scope.data.windowTitle;
				}
				standardSaveOptions($scope, saveWidgetConfig, form.$valid);
			};
			setupWidgetOptionFunctions($scope);
		}
	]);

	personalisedDashboardModule.controller("applicationListController", ["$scope", "widget", "Restangular", "getAppsOfType",
		"arrayTableModelService", "saveWidgetConfig", "MINICOLORS_SETTINGS", "TITLE_BAR_COLORS",
		function ($scope, widget, Restangular, getAppsOfType, arrayTableModelService, saveWidgetConfig, MINICOLORS_SETTINGS, TITLE_BAR_COLORS) {
			$scope.ready = false;
			$scope.resultTable = {};
			var STATUSES_TO_ICONS = {
				RUNNING: "ok",
				STOPPED: "remove",
				NOT_CONFIGURED: "ban-circle",
				INVALID_SERVER: "exclamation-sign"
			};
      $scope.widget = widget;
      toggleWidgetResize($scope.widget);
      $scope.widget.searchBox = filterWidget;
      $scope.data = _.extend({
        gridMode: $scope.widget.config.gridLayout === undefined ? true : $scope.widget.config.gridLayout,
      }, getStandardWidgetData($scope, MINICOLORS_SETTINGS, TITLE_BAR_COLORS));

			$scope.$watch("resultTable.updateInProgress", function (newVal, oldVal) {
				if (oldVal && !newVal) {
					$scope.ready = true;
				}
			});
			$scope.$watch("data.titleBgColor", function (newVal, oldVal) {
                $scope.widget.bgColor = newVal;
			});
			$scope.$watch("data.titleTxtColor", function (newVal, oldVal) {
                $scope.widget.txtColor = newVal;
			});

			$scope.update = function (withSave) {
				$scope.ready = false;
				Restangular.all("message").post({
						type: "application-list",
						method: "getData",
						appId: null
				}).then(
					function (message) {
						var results = JSON.parse(message.payload);
						$scope.resultTable = arrayTableModelService.createArrayTableModel(results,
						function(app) {
							app.statusIcon = STATUSES_TO_ICONS[app.status];
							app.oauthLinkConfigured = app.linkConfigured ? "Yes" : "No";
							app.pictureType = app.type.toLowerCase();
							return {data: app, url: app.url, defaultAction: [], external: true};
						}, false, ["name", "type"]);
						$scope.ready = false;
					}, function() { $scope.ready = true });
			};
			$scope.update(false);

			$scope.$watch('data.gridMode', function (gridMode) {
				//Don't always save as this is fired on startup
				if (typeof gridMode === "string") {
					gridMode = gridMode === "true";
				}
				if ($scope.widget.config.gridLayout !== gridMode) {
                    $scope.widget.config.gridLayout = gridMode;
					saveWidgetConfig($scope);
				}
			});

			$scope.saveOptions = function(form) {
				standardSaveOptions($scope, saveWidgetConfig, form.$valid);
			};
			setupWidgetOptionFunctions($scope);
		}
	 ]);

		personalisedDashboardModule.controller("nexusReportController", ["$q", "$scope", "widget", "Restangular",
        	"getAppsOfType", "arrayTableModelService", "saveWidgetConfig", "MINICOLORS_SETTINGS", "TITLE_BAR_COLORS",
        		function ($q, $scope, widget, Restangular, getAppsOfType, arrayTableModelService, saveWidgetConfig,
        		MINICOLORS_SETTINGS, TITLE_BAR_COLORS) {

        		    $scope.showConfigModal = false;
        			$scope.ready = true;
                    $scope.hasResults = false;
        		    $scope.nexusApps = [];
        		    $scope.errorStatus = null;
                    $scope.widget = widget;
                    toggleWidgetResize($scope.widget);

                    $scope.data = getStandardWidgetData($scope, MINICOLORS_SETTINGS, TITLE_BAR_COLORS);
                    setupWidgetOptionFunctions($scope);

                    $("#widget-modal-"+widget.id).on('shown.bs.modal', function() {
                        $scope.showConfigModal = true;
                    });

        			$scope.showWidgetConfigModal = function(){
	                    $scope.ready = true;
						getNexusConfig($scope, Restangular,
							function getConfigDetails(nexusConfig){
								angular.forEach($scope.nexusApps, function(nexusApp) {
									var configSelectedReports = nexusApp.reports.filter(function (currentReport) {
										return currentReport.selected;
									});
									angular.forEach(configSelectedReports, function(configReport) {
										if(!nexusApp.selectedStages) {
											nexusApp.selectedStages = [];
										}
										nexusApp.selectedStages.push(configReport.stage);
									});
								});
							});
					}

                    $scope.saveNexusConfig = function(nexusApps) {
						var configToSave = [];
                        angular.forEach(nexusApps, function(eachNexusApp){
                            var appSelected = eachNexusApp.selected;
                            if (appSelected) {
                                var appConfig = {};
                                appConfig.name = eachNexusApp.name;
                                appConfig.showLicenseData = eachNexusApp.showLicenseData;
                                appConfig.showSecurityData = eachNexusApp.showSecurityData;
                                appConfig.selected = eachNexusApp.selected;
                                appConfig.internalId = eachNexusApp.internalId;

                                var selectedAppReports = [];
                                angular.forEach(eachNexusApp.reports, function(reportStage){
                                var reportConfig = {};
                                if(eachNexusApp.selectedStages && eachNexusApp.selectedStages.indexOf(reportStage.stage) >= 0){
                                        reportConfig.selected = true;
                                        reportConfig.stage = reportStage.stage;
                                        reportConfig.reportDataUrl = reportStage.reportDataUrl;
                                        reportConfig.reportLinkUrl = reportStage.reportLinkUrl;
                                        selectedAppReports.push(reportConfig);
                                    }
                                });
                                appConfig.reports = selectedAppReports;
                                configToSave.push(appConfig);
                            }
                        });
                        $scope.config.applications = configToSave;
			            standardSaveOptions($scope, saveWidgetConfig, true);
                    };

                    $scope.update = function () {
                        $scope.ready = false;
                        Restangular.all("nexus/widget/" + widget.id + "/report").getList().then(function (nexusAppsRes) {
                            $scope.errorStatus = null;
                            $scope.hasResults = false;
                            $scope.nexusApps = nexusAppsRes;

                            if ($scope.nexusApps) {
                                $scope.nexusApps.forEach(function(nexusApp) {
                                    var nexusAppHasResults = nexusApp.selected && nexusApp.hasOwnProperty("reports") && nexusApp.reports.length > 0 && (nexusApp.showSecurityData || nexusApp.showLicenseData);

                                    if (nexusApp.reports) {
                                        var nexusAppHasReports = false;
                                        nexusApp.reports.forEach(function(report) {
                                            nexusAppHasReports = nexusAppHasReports || report.selected;
                                        });
                                        nexusAppHasResults = nexusAppHasResults && nexusAppHasReports;
                                    }

                                    nexusApp.hasResults = nexusAppHasResults;
                                    $scope.hasResults = $scope.hasResults || nexusAppHasResults;
                                });
                            }

                            $scope.ready = true;
                        },function(error){
                            $scope.errorStatus = error.status;
                            $scope.ready = true;
                        });
                    }

                    if (widget.id !== undefined) {
                        $scope.update();
                    }
            }
		]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Controllers
	///////////////////////////////////////////////////////////////////////////////////////////////////
	personalisedDashboardModule.controller("personalisedDashboardController", ["$q", "$scope", "Restangular", "authStateService", "$timeout", "getAppsOfType", "taskTimer",
	    "dashboard", function ($q, $scope, Restangular, authStateService, $timeout, getAppsOfType, taskTimer, dashboard) {
			showMask(true, "Loading Dashboard");
			$scope.data = {
				prettyTimeSpentOnTask: 0
			};
			//Sets up installed applications
			$scope.availableApps = {};
			getAppsOfType().then(function (availableApps) {
				$scope.availableApps = availableApps;

				setTaskNamePopover();
			});

			var widgetTitleTemplateUrl = "partials/widgets/widgetTitleTemplate.html";
			$scope.model = {
				structure: "(1) Header with two columns",
				rows: []
			};
			$scope.activeTaskTimers = [];

			$scope.resetDashboard = function () {
				$scope.model = {
					structure: "(1) Header with two columns",
					rows: [{
						"columns": [{
							styleClass: "col-md-12",
							widgets: [{
								type: "jira",
								config: {}
							}]
						}]
					}, {
						"columns": [{
							styleClass: "col-md-6",
							widgets: [{
								type: "confluence-tasks",
								config: {}
							}]
						}, {
							styleClass: "col-md-6",
							widgets: [{
								type: "confluence-notifications",
								config: {}
							}]
						}]
					}]
				};
				$scope.model.title = "Dashboard";
				$scope.model.titleTemplateUrl = "partials/widgets/dashboardTitleTemplate.html";
				$scope.model.editTemplateUrl = "partials/widgets/dashboardEdit.html";

				var allWidgets = getWidgets($scope.model);
				for (var widgetIndex in allWidgets) {
					if (!allWidgets.hasOwnProperty(widgetIndex)) {
						continue;
					}
					var widget = allWidgets[widgetIndex];
					widget.titleTemplateUrl = widgetTitleTemplateUrl;
					widget.autoRefresh = "0";
				}
				$("#reset-dashboard-modal").modal("hide");
			};

            var restoreDashboard = function (dashboardResponse) {
            	var usedStructureName = dashboardResponse.structure;
                var structure = dashboard.structures[usedStructureName];
                if (!structure) {
                	usedStructureName = _.first(Object.keys(dashboard.structures));
                	structure = dashboard.structures[usedStructureName];
                	console.warn("Dashboard layout structure with name '" + dashboardResponse.structure + "' could not be found. Using '" + usedStructureName + "' instead");
                }

                var model = {
                	id: dashboardResponse.id,
                	title: dashboardResponse.title,
                	structure: usedStructureName,
                    rows: _.cloneDeep(structure.rows),
                    refreshInterval: dashboardResponse.refreshInterval
                }

                var columnsTemp = _.clone(dashboardResponse.columns);
                while (!_.isEmpty(columnsTemp)) {
                    fillLayout(model, columnsTemp);
                }

                return model;
            };

            var fillLayout = function (root, columns) {
                _.forEach(root.rows, function (row) {
                    if (_.isEmpty(columns)) {
                        return false;
                    }
                    _.forEach(row.columns, function (column) {
                        if (_.isEmpty(columns)) {
                            return false;
                        } else {
                            if (_.isUndefined(column.row)) {
                                copyWidgets(columns.shift(), column);
                            } else {
                                fillLayout(column, columns);
                            }
                        }
                    });
                });
            };

            var copyWidgets = function(source, target) {
                if (!target.widgets) {
                    target.widgets = [];
                }

                if (source && source.widgets) {
		            _.forEach(source.widgets, function (widget) {
		            	if (!widget.config) {
		            		widget.config = {};
		            	}
		                target.widgets.push(widget);
		            });
                }
            };

            Restangular.all("dashboard").getList().then(function (dashboards) {
	            if (_.isEmpty(dashboards)) {
	                return $q.reject();
	            } else {
	                return Restangular.one("dashboard", dashboards[0].id).get();
	            }
	        }).then(function (dashboardResponse) {
				$scope.model = restoreDashboard(dashboardResponse);
				$scope.model.titleTemplateUrl = "partials/widgets/dashboardTitleTemplate.html";
				$scope.model.editTemplateUrl = "partials/widgets/dashboardEdit.html";

				setupRefreshTimer($scope.model);
				if ($scope.model.hasOwnProperty("refreshInterval")) {
					$('input[name="refreshIntervalRadio"]').prop("checked", false);
					$('#refresh-timer-' + $scope.model.refreshInterval).prop("checked", true);
				}

				var allWidgets = getWidgets($scope.model);
				for (var widgetIndex in allWidgets) {
					if (!allWidgets.hasOwnProperty(widgetIndex)) {
						continue;
					}
					var widget = allWidgets[widgetIndex];
					widget.titleTemplateUrl = widgetTitleTemplateUrl;

					setupIndividualRefreshTimer(widget);
				}

				showMask(false);

			}, personalisedDashboardModule.createErrorHandler($scope));

			$scope.$on("adfDashboardChanged", function (event, name, model) {

	            var saveUnsavedWidgets = function(dashboard) {
	            	var allWidgets = getWidgets(dashboard);
	            	var promises = [];
	            	_.forEach(allWidgets, function(widget) {
	            		if (!widget.id) {
	            			promises.push(Restangular.one("dashboard", dashboard.id).one("widget", "")
	        					.customPOST({
									config: widget.config,
									title: widget.title,
									autoRefresh: widget.autoRefresh,
									bgColor: widget.bgColor,
									txtColor: widget.txtColor,
									type: widget.type,
									height: widget.height
	    					}).then(function(savedWidget) {
	            				widget.id = savedWidget.id;
                                widget.dashboardId = savedWidget.dashboardId;
                                toggleWidgetResize(widget);
	            			}));
	            		} else {
	            		    promises.push(Restangular.one("dashboard", dashboard.id).one("widget", widget.id)
                            .customPUT({
                                config: widget.config,
                                title: widget.title,
                                autoRefresh: widget.autoRefresh,
                                bgColor: widget.bgColor,
                                txtColor: widget.txtColor,
                                type: widget.type,
                                height: widget.height
                            }).then(function(updatedWidget) {
                            }));
	            		}
	            	});
	            	return $q.all(promises);
	            };

	            saveUnsavedWidgets($scope.model).then(function() {
	            	return Restangular.one("dashboard", $scope.model.id).customPUT(prepareDashboard($scope.model))
	            }).catch(personalisedDashboardModule.createErrorHandler($scope));
			},personalisedDashboardModule.createErrorHandler($scope));

            $scope.cancelResetDashboard = function () {
				$("#reset-dashboard-modal").modal("hide");
			};
			$scope.$on("resetDashboardTriggered", function () {
				$("#reset-dashboard-modal").modal("show");
			});
			// set our custom widget title template when widgets are added
			$scope.$on('adfWidgetAdded', function (event, name, model, widget) {
				widget.titleTemplateUrl = widgetTitleTemplateUrl;
				toggleWidgetResize(widget);
			});

			$scope.$on('adfAutoRefreshButtonClicked', function () {
				$("#dashboard-refresh-timer-modal").modal("show");
			});

			$scope.setupRefreshTimer = function () {
				$scope.model.refreshInterval = parseInt($('input[name="refreshIntervalRadio"]:checked').val(), 10);
				$("#dashboard-refresh-timer-modal").modal("hide");
				setupRefreshTimer($scope.model);
				$scope.$broadcast("adfDashboardChanged");
			};

			$scope.cancelDashboardRefreshModal = function () {
				$("#dashboard-refresh-timer-modal").modal("hide");
			};

			$scope.stopTaskTimer = function() {
				taskTimer.stop($scope.availableApps[$scope.activeTaskTimers[0].appId], $scope.activeTaskTimers[0].id);
			};

            var setTaskNamePopover = function() {
                if ($scope.activeTaskTimers && $scope.activeTaskTimers.length && $scope.availableApps && $scope.availableApps[$scope.activeTaskTimers[0].appId]) {
                    var activeTaskTimer = $scope.activeTaskTimers[0];
                    var summary = activeTaskTimer.summary;
                    $(".activeTaskTimerName").popover("destroy");
                    $(".activeTaskTimerName").popover({
                        content: "<em>" + _.escape($scope.availableApps[activeTaskTimer.appId].name) + "</em>: "
                        + _.escape(activeTaskTimer.remoteId) + (summary ? " / " + _.escape(summary) : ""),
                        html: true,
                        placement: "auto top"
                    });
                }
            };

			$scope.getActiveTaskTimers = function () {
				Restangular.all("task-timer").getList().then(function(data) {
					$scope.activeTaskTimers = data;
					$scope.updateTimerDuration();

          if (data && data.length) {
            Restangular.one("application/" + data[0].appId + "/jira/issue/" + data[0].remoteId).get({fields: "summary"}).then(function (issue) {
              $scope.activeTaskTimers[0].summary = issue.summary;
              setTaskNamePopover();
            });
          }
				});
			};
			$scope.getActiveTaskTimers();
			$scope.$on("taskTimersUpdated", function (event, name, model) {
				$scope.getActiveTaskTimers();
			});

            $scope.showTaskPopoverIfNeeded = function ($event) {
                var target = $event.target.closest(".activeTaskTimerName");
                if (target && target.offsetWidth < target.scrollWidth) {
                    $(target).popover("show");
                }
            };

            $scope.hideTaskPopover = function ($event) {
                $($event.target).closest(".activeTaskTimerName").popover("hide");
            };

			var updateTimerDurationTimer = null;
			$scope.updateTimerDuration = function() {
				if ($scope.activeTaskTimers != null && $scope.activeTaskTimers.length > 0) {
					//Note this is in UTC
					var taskStartTime = moment.utc($scope.activeTaskTimers[0].startTime);
					$scope.data.prettyTimeSpentOnTask = taskStartTime.fromNow();
				} else {
					$scope.data.prettyTimeSpentOnTask = 0
				}
				if (updateTimerDurationTimer != null) {
					clearTimeout(updateTimerDurationTimer);
				}
				updateTimerDurationTimer = $timeout($scope.updateTimerDuration, 1000);
			}
		}
	]);

	var refreshTimer = null;
	function setupRefreshTimer(model) {
		if (refreshTimer != null) {
			clearTimeout(refreshTimer);
		}
		if (model !== null && model.hasOwnProperty("refreshInterval")) {
			if (model.refreshInterval) {
				refreshTimer = setTimeout(function () {
					if(!angular.element(".dashboard").scope().editMode) {
						window.location.reload();
					} else {
						setupRefreshTimer(model);
					}
				}, model.refreshInterval * 60000, model);
			}
		}
	}

    function getColumns(root, columns) {
        _.forEach(root.rows, function (row) {
            _.forEach(row.columns, function (column) {
                columns.push({
                    widgets: _.map(column.widgets, prepareWidget)
                });
                getColumns(column, columns);
            });
        });
    }

    function prepareDashboard(model) {
        var dashboard = {};

        if (model.hasOwnProperty("refreshInterval")) {
            dashboard.refreshInterval = model.refreshInterval;
        }

        dashboard.structure = model.structure;
        dashboard.title = model.title;

        dashboard.columns = [];
        getColumns(model, dashboard.columns);

        return dashboard;
    }

	function prepareWidget(widget) {
	    return {
            id: widget.id
        };
	}

	function getWidgets(model) {
		var widgets = [];
		for (var rowIndex in model.rows) {
			var row = model.rows[rowIndex];
			for (var columnIndex in row.columns) {
				if (!row.columns.hasOwnProperty(columnIndex)) {
					continue;
				}
				var column = row.columns[columnIndex];
				if (column.hasOwnProperty("rows")) {
					widgets = widgets.concat(getWidgets(column))
				}
				for (var widgetIndex in column.widgets) {
					if (!column.widgets.hasOwnProperty(widgetIndex)) {
						continue;
					}
					var widget = column.widgets[widgetIndex];
					widgets.push(widget);
				}
			}
		}
		return widgets;
	}

	function setUpOnApplicationLinksAvailableChange($scope, listApplicationLinks, callback) {
		$scope.$on("listApplicationLinksChanged", function () {
			$scope.data.applicationLinks = listApplicationLinks($scope.appType, $scope.data.chosenApp.id);
			if (callback !== undefined) {
				callback();
			}
		});
	}

	function getApplications($scope, getAppsOfType, $q) {
		return getAppsOfType($scope.appType).then(function (availableApps) {
			$scope.data.availableApps = availableApps;
			if ($scope.data.availableApps.length > 0) {
				handleAppsAvailable($scope);
			} else {
				$scope.ready = true;
				return $q.reject();
			}
		});
	}

	function handleAppsAvailable($scope) {
		if ($scope.widget.config.chosenApp !== undefined) {
			$scope.data.chosenApp = _.find($scope.data.availableApps, {
				"id": $scope.widget.config.chosenApp
			});
		} else {
			$scope.data.chosenApp = $scope.data.availableApps[0];
		}
	}

	function convertJiraIssueRow(rowItem) {
		rowItem.project = "UNKNOWN";
		rowItem.name = "Unknown";
		rowItem.description = "Unknown";
		rowItem.status = "Unknown";
		rowItem.statusCategory = "Unknown";
		rowItem.icon = {
			src: blankImage,
			alt: "Unknown"
		};
		rowItem.priorityIcon = {
			src: blankImage,
			alt: "Unknown"
		};
		rowItem.assignedImage = {
			src: blankImage,
			alt: "Unassigned"
		};
		rowItem.statusIcon = {
			src: blankImage,
			alt: "Unknown"
		};

		if (rowItem.fields.hasOwnProperty("project") && rowItem.fields.project !== null) {
			rowItem.project = rowItem.fields.project.name;
			rowItem.projectIcon = {
				src: rowItem.fields.project.avatarUrls["24x24"],
				alt: rowItem.fields.project.name
			};
		}

		if (rowItem.fields.hasOwnProperty("summary") && rowItem.fields.summary !== null) {
			rowItem.name = rowItem.fields.summary;
		}
		if (rowItem.fields.hasOwnProperty("description")) {
			rowItem.description = rowItem.fields.description;
		}

		if (rowItem.fields.hasOwnProperty("issuetype") && rowItem.fields.issuetype !== null) {
			rowItem.icon = {
				src: rowItem.fields.issuetype.iconUrl,
				alt: rowItem.fields.issuetype.name,
			};
		}
		if (rowItem.fields.hasOwnProperty("priority") && rowItem.fields.priority !== null) {
			rowItem.priorityIcon = {
				src: rowItem.fields.priority.iconUrl,
				alt: rowItem.fields.priority.name
			}
		}
		if (rowItem.fields.hasOwnProperty("status") && rowItem.fields.status !== null) {
			rowItem.status = rowItem.fields.status.name;
			rowItem.statusIcon = {
				src: rowItem.fields.status.iconUrl,
				alt: rowItem.fields.status.name,
			};
		}
		if (rowItem.fields.status.hasOwnProperty("statusCategory")) {
			rowItem.statusCategory = rowItem.fields.status.statusCategory.name;
		}
		if (rowItem.fields.assignee != null && rowItem.fields.assignee !== null) {
			rowItem.assignedImage = {
				src: rowItem.fields.assignee.avatarUrls["24x24"],
				alt: rowItem.fields.assignee.displayName
			};
		}
		return rowItem;
	}

	function standardMessageCall(Restangular, $scope, method, payload, callback) {
		var params = {
			type: $scope.appType.toLowerCase(),
			method: method,
			payload: payload
		};
		if($scope.data.chosenApp !== undefined){
			params.appId = $scope.data.chosenApp.id;
		}
		if (payload != null) {
			params.payload = payload;
		}
		Restangular.all("message").post(params)
			.then(
				callback, personalisedDashboardModule.createErrorHandler($scope)
			);
	}

	function standardMessageCallback(returnData, $scope, configOption, fullList, chosenItem, payloadDictEntry,
		payloadDictEntry2) {
		var parsedData = JSON.parse(returnData.payload);
		if (payloadDictEntry !== undefined && payloadDictEntry !== null) {
			parsedData = parsedData[payloadDictEntry];
		}
		if (payloadDictEntry2 !== undefined && payloadDictEntry2 !== null) {
			parsedData = parsedData[payloadDictEntry2];
		}
		var chosen = null;
		if (parsedData.length > 0) {
			//Board columns don"t have an ID they only have a name :/
			var columnId = "id";
			if (!parsedData[0].hasOwnProperty("id")) {
				columnId = "name";
			}
			if (configOption !== undefined && configOption !== null) {
				var findDict = {};
				findDict[columnId] = configOption;
				//Note this could potentially result in setting it to null, which currently isnt a problem but we
				//may need to revisit in the future. Note it is required to return null for board columns
				//should the saved option being all columns
				chosen = _.find(parsedData, findDict);
				if (chosen == undefined && parsedData.length > 0) {
					chosen = parsedData[0];
				}
			} else {
				chosen = parsedData[0];
			}
		}
		$scope.data[fullList] = parsedData || [];
		$scope.data[chosenItem] = chosen;
	}

	function sanitizeEventDateTime(event, settings) {
		var updatedEvent = event;

		if(event.start.dateTime !== undefined){
			var eventStartDateTime = moment(event.start.dateTime);
			var eventEndDateTime = moment(event.end.dateTime);
			//sanitize time
			var isFormat24HourTime = _.result(_.find(settings,function(setting){
											return setting.id === "format24HourTime";
										}), "value");
			var timeFormat = "hh:mm a";
			if(isFormat24HourTime === "true"){
				timeFormat = "HH:mm"
			}
			updatedEvent.date = eventStartDateTime.format("DD-MM-YYYY");
			updatedEvent.displayTime = eventStartDateTime.format(timeFormat) + "-" + eventEndDateTime.format(timeFormat);
		}else{
			updatedEvent.displayTime = "All Day";
			updatedEvent.date = moment(event.start.date).format("DD-MM-YYYY");
		}

		return updatedEvent;
	}

	function getAppForAtlassianLinkId($scope, listApplicationLinks, Restangular, atlassianAppLinkId, createDummyApp) {
		var toReturn;

		_.forEach($scope.data.installedApps, function (app) {
			if (app.atlassianAppLinkId == atlassianAppLinkId) {
				toReturn = app;
				return false;
			}
		});

		if (!toReturn) {
			if ($scope.data.applicationLinks === undefined) {
				$scope.data.applicationLinks = listApplicationLinks($scope.appType, $scope.data.chosenApp.id);
			}

			_.forEach($scope.data.applicationLinks, function (app) {
				if (app.application.id == atlassianAppLinkId) {
					_.forEach($scope.data.installedApps, function (installedApp) {
						if (app.application.rpcUrl == installedApp.url) {
							installedApp.atlassianAppLinkId =  app.application.id;
							Restangular.one("application/installed-application", installedApp.id).one("atlassian-app-link-id", "").customPUT(app.application.id).then();
							toReturn = installedApp;
							return false;
						}
					});

					// When app is not linked in spectrum we could need to return only its url
					if (createDummyApp && !toReturn) {
						toReturn = {
							url: app.application.url
						}
					}

					return false;
				}
			});
		}
		return toReturn;
	}

    function filterWidget(e) {
        var element = e.target;
        var searchText = "";
        if (element.tagName.toLowerCase() === "input") {
            searchText = element.value;
        } else {
            searchText = angular.element("#widget-filter-" + this.wid).val();
        }
        var spectrumTableScope = angular.element('#widget-result-table-' + this.wid).scope();
        if (spectrumTableScope !== undefined) {
            spectrumTableScope.$parent.resultTable.filterApplied(searchText);
        }
    }

	function getNexusConfig($scope, Restangular, callback) {
		showMask(true, "Loading Config");
		Restangular.one("nexus/widget/" + $scope.widget.id + "/config").get().then(function (nexusConfig) {
			$scope.errorStatus = null;
			$scope.nexusApps = JSON.parse(JSON.parse(nexusConfig.config).applications);
			showMask(false);
			callback(nexusConfig);
			$("#widget-modal-"+$scope.widget.id).modal("show");
		}, function(error) {
			$scope.errorStatus = error.status;
			showMask(false);
		});
	};
})();
