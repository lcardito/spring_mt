(function () {
	"use strict";
	var processesModule = angular.module("processesModule", ["ui.router",
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
		"spectrumTransformModule"
	]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration & Initialisation
	///////////////////////////////////////////////////////////////////////////////////////////////////
	processesModule
		.constant("DATE_FORMAT", "MMM Do, YYYY h:mm:ss A")
		.config(["$stateProvider", "$urlRouterProvider", "RestangularProvider", function ($stateProvider, $urlRouterProvider,
			RestangularProvider) {
            RestangularProvider.setBaseUrl(baseUrl + "/rest-with-cookies/api/v1");

			$urlRouterProvider.otherwise("/processes");
			$stateProvider
			.state('processes', {
				abstract: true,
				url: '/processes',
				// Note: abstract still needs a ui-view for its children to populate.
				template: '<ui-view/>',
				data: {
					breadcrumbProxy: 'processes.list'
				}
			})
			.state("processes.list", {
				url: "",
				templateUrl: "partials/process-list.html",
				controller: "ListController",
				data: {
					displayName: 'Processes'
				}
			})
			.state("processes.report-generator", {
				url: "/report-generator",
				templateUrl: "partials/process-report-generator.html",
				controller: "ProcessReportGeneratorController",
				data: {
					displayName: 'Report Generator'
				}
			})
			.state("processes.upload", {
				url: "/upload",
				templateUrl: "partials/process-upload.html",
				controller: "UploadController",
				data: {
					displayName: 'Upload Process'
				},
			})
			.state("processes.extract", {
				url: "/extract",
				templateUrl: "partials/process-extract.html",
				controller: "ExtractController",
				data: {
					displayName: 'Extract'
				}
			})
			.state('processes.detail', {
				abstract: true,
				url: '/:processId',
				// Note: abstract still needs a ui-view for its children to populate.
				template: '<ui-view/>',
				data: {
					breadcrumbProxy: 'processes.detail.edit'
				},
				resolve: {
					process: ['$stateParams', function($stateParams){
						return $stateParams.processId;
					}]
				}
			})
			.state("processes.detail.edit", {
				url: "",
				templateUrl: "partials/process-edit.html",
				controller: "EditProcessController",
				data: {
					displayName: 'Process {{process}}'
				}
			})
			.state("processes.detail.manifest", {
				url: "/manifest",
				templateUrl: "partials/process-manifest.html",
				controller: "ManifestController",
				data: {
					displayName: 'Manifest'
				}
			})
			.state("processes.detail.deploy", {
				url: "/deploy",
				templateUrl: "partials/process-deploy.html",
				controller: "DeployController",
				data: {
					displayName: 'Deploy'
				}
			})
			.state('processes.detail.version', {
				abstract: true,
				url: '/version',
				// Note: abstract still needs a ui-view for its children to populate.
				template: '<ui-view/>',
				data: {
					breadcrumbProxy: 'processes.detail.version.list'
				}
			})
			.state("processes.detail.version.list", {
				url: "",
				templateUrl: "partials/process-version-list.html",
				controller: "VersionsController",
				data: {
					displayName: 'Versions'
				}
			})
			.state("processes.detail.version.extract", {
				url: "/extract",
				templateUrl: "partials/process-extract.html",
				controller: "ExtractController",
				data: {
					displayName: 'Extract'
				}
			})
			.state("processes.detail.version.upload", {
				url: "/upload",
				templateUrl: "partials/process-upload.html",
				controller: "UploadController",
				data: {
					displayName: 'Upload'
				}
			})
			.state('processes.detail.version.detail', {
					abstract: true,
					url: '/:versionId',
					template: '<ui-view/>',
					data: {
						breadcrumbProxy: 'processes.detail.version.detail.edit'
					},
					resolve: {
						version: ['$stateParams', function ($stateParams){
							return $stateParams.versionId;
						}]
					}
			})
			.state("processes.detail.version.detail.edit", {
				url: "",
				templateUrl: "partials/process-version-edit.html",
				controller: "EditProcessVersionController",
				data: {
					displayName: 'Version {{version}}'
				}
			})
			.state("processes.detail.version.detail.diff", {
				url: "/diff/:compareWithVersionId",
				templateUrl: "partials/process-diff.html",
				controller: "DiffController",
				data: {
					displayName: 'Diff'
				}
			})
			.state("processes.detail.version.detail.manifest", {
				url: "/manifest",
				templateUrl: "partials/process-manifest.html",
				controller: "ManifestController",
				data: {
					displayName: 'Manifest'
				}
			})
			.state("processes.detail.version.detail.deploy", {
				url: "/deploy",
				templateUrl: "partials/process-deploy.html",
				controller: "DeployController",
				data: {
					displayName: 'Deploy'
				}
			});
		}])
		.createErrorHandler = function ($scope, response) {
			//Note - this is the one module that does thing differently than the others :/
			spectrumRestangularErrorHandler($scope);
			if (response.status === 500) {
				$scope.error = "500 Internal server error. Check logs for more details";
			} else {
				var responseIsHtml = response.headers("Content-Type").indexOf("text/html") === 0;

				if (!responseIsHtml) {
					processesModule.processErrorMessageJson($scope, response.data);
				} else {
					$scope.error = response.status + " Error. See Spectrum/JIRA logs for details";
				}
			}
		};
	processesModule.processErrorMessageJson = function ($scope, errorMessageJson) {
		if (errorMessageJson[0]) {
			$scope.error = "";
			var problems = errorMessageJson;
			angular.forEach(problems, function (problem) {
				$scope.error = $scope.error + "\n" + problem.message + "\n";
			});
		} else if (errorMessageJson.message !== undefined) {
			$scope.error = errorMessageJson.message;
		}
	};
	processesModule.retrieveProcess = function ($scope, $stateParams, Restangular) {
		if ($stateParams.processId !== undefined) {
			Restangular.one("processes", $stateParams.processId).get().then(function (process) {
				$scope.process = _.pick(process, "title", "description");
				$scope.defaultTitle = process.title;
			});
		}
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Controllers
	///////////////////////////////////////////////////////////////////////////////////////////////////
	processesModule
		.controller("ListController", ["$scope", "$timeout", "Restangular", "restTableModelService", "DATE_FORMAT",
			function ($scope, $timeout, Restangular, restTableModelService, DATE_FORMAT) {
				showMask(true, "Loading process list")
				$scope.addActions = [{
					name: "Extract from JIRA",
					icon: "import",
					run: "process.html#/processes/extract"
				}, {
					name: "Upload",
					icon: "open",
					run: "process.html#/processes/upload"
				}];

				var download = function (process) {
					var fileUrl = getHostAndPort() + process.getRequestedUrl() + "/process-file";

					var iframe = document.createElement("iframe");
					iframe.setAttribute("src", fileUrl);
					iframe.setAttribute("style", "display: none");
					iframe.addEventListener("load", function () {
						$timeout(function () {
							var iframeContent = iframe.contentDocument.body.textContent;
							processesModule.processErrorMessageJson($scope,
								JSON.parse(iframeContent.substring(1, iframeContent.length - 1)));
						});
					});
					document.body.appendChild(iframe);
				};

				var downloadXMLManifest = function (process) {

					var fileUrl = getHostAndPort() + process.getRequestedUrl() + "/xmlmanifest";

					var iframe = document.createElement("iframe");
					iframe.setAttribute("src", fileUrl);
					iframe.setAttribute("style", "display: none");
					iframe.addEventListener("load", function () {
						$timeout(function () {
							var iframeContent = iframe.contentDocument.body.textContent;
							processesModule.processErrorMessageJson($scope,
								JSON.parse(iframeContent.substring(1, iframeContent.length - 1)));
						});
					});
					document.body.appendChild(iframe);
				};

				var downloadPDFManifest = function (process) {

					var fileUrl = getHostAndPort() + process.getRequestedUrl() + "/pdfmanifest";

					var iframe = document.createElement("iframe");
					iframe.setAttribute("src", fileUrl);
					iframe.setAttribute("style", "display: none");
					iframe.addEventListener("load", function () {
						$timeout(function () {
							var iframeContent = iframe.contentDocument.body.textContent;
							processesModule.processErrorMessageJson($scope,
								JSON.parse(iframeContent.substring(1, iframeContent.length - 1)));
						});
					});
					document.body.appendChild(iframe);
				};

				var createProcessRowModel = function () {};

				var remove = function (process) {
					var html =
						"<span class='help-block text-center'>" +
						"Are you sure you want to delete ALL versions of process " +
						"<strong>'" + process.title + "'</strong>?" +
						"</span>";

					bootbox.confirm(html,
						function (result) {
							if (result) {
								showMask(true, "Deleting");
								Restangular.one("processes", process.id).customDELETE().then(
									function () {
										showMask(false);
										createProcessRowModel();
									},
									function () {
										showMask(false);
									}
								);
							}
						}
					);
				};

				createProcessRowModel = function () {
					$scope.processRowModel = restTableModelService.createRestTableModel("processes",
						function (process) {
							var defaultAction = {
								run: "process.html#/processes/" + process.id + "/version"
							};
							var actionObjects = [{
								name: "Deploy to JIRA",
								icon: "export",
								class: "default",
								run: "process.html#/processes/" + process.id + "/deploy"
							}, {
								name: "Extract from JIRA",
								icon: "import",
								run: "process.html#/processes/" + process.id + "/version/extract"
							}, {}, {
								name: "Upload",
								icon: "open",
								run: "process.html#/processes/" + process.id + "/version/upload"
							}, {
								name: "Download",
								icon: "save",
								class: "default",
								run: function (data) {
									download(data);
								}
							}, {}, {
								name: "Inspect manifest",
								icon: "sunglasses",
								class: "default",
								run: "process.html#/processes/" + process.id + "/manifest"
							}, {
								name: "Download XML manifest",
								icon: "list-alt",
								class: "default",
								run: function (data) {
									downloadXMLManifest(data);
								}
							}, {
								name: "Download PDF manifest",
								icon: "text-background",
								class: "default",
								run: function (data) {
									downloadPDFManifest(data);
								}
							}, {
								name: "Manage versions",
								icon: "th-list",
								class: "default",
								run: "process.html#/processes/" + process.id + "/version"
							}, {}, {
								name: "Edit",
								icon: "pencil",
								class: "default",
								run: "process.html#/processes/" + process.id
							}, {
								name: "Delete process",
								icon: "trash",
								class: "default",
								run: function (data) {
									remove(data);
								}
							}];

							process.createDate = moment(process.createDate).format(DATE_FORMAT);
							if (process.updateDate === null) {
								process.updateDate = process.createDate;
							} else {
								process.updateDate = moment(process.updateDate).format(DATE_FORMAT);
							}

							return {
								data: process,
								actions: actionObjects,
								defaultAction: defaultAction
							};
						}
					);
				};
				createProcessRowModel();
			}
		])
		.controller("ProcessReportGeneratorController", ["$scope", "$stateParams", "$timeout", "Restangular",
			function ($scope, $stateParams, $timeout, Restangular) {

				$scope.jiraApp = {};
				$scope.jiraProject = {};
				$scope.process = {};

				Restangular.one("application/installed-application").getList("jira-application").then(
					function (jiraApps) {
						$scope.jiraApps = _.filter(jiraApps, function(jiraApp) {
							return jiraApp.linkConfigured;
						});
					},
					function (response) {
						processesModule.createErrorHandler($scope, response);
					}
				);

				processesModule.retrieveProcess($scope, $stateParams, Restangular);

				var setJiraProjects = function () {
					if ($scope.jiraApp.value !== null) {
						Restangular.one("processmanager/jira-apps", $scope.jiraApp.value.id).getList("projects").then(
							function (jiraProjects) {
								$scope.jiraProjects = jiraProjects;
								showMask(false);
							},
							function (response) {
								showMask(false);
								processesModule.createErrorHandler($scope, response);
								$scope.jiraApp = {};
							}
						);
					}
				};

				$scope.selectedJira = function () {
					delete $scope.jiraProject.value;
					delete $scope.jiraProjects;
					delete $scope.plugins;
					delete $scope.customFields;
					delete $scope.error;
					setJiraProjects();
				};

				$scope.projectSelected = function () {
					delete $scope.error;
				};

				$scope.report = function () {
					var fileUrl = baseUrl + "/rest-with-cookies/api/v1/processmanager/jira-apps/" +
						$scope.jiraApp.value.id + "/projects/" + $scope.jiraProject.value.key + "/report";

					var iframe = document.createElement("iframe");
					iframe.setAttribute("src", fileUrl);
					iframe.setAttribute("style", "display: none");
					iframe.addEventListener("load", function () {
						$timeout(function () {
							var iframeContent = iframe.contentDocument.body.textContent;
							processesModule.processErrorMessageJson($scope,
								JSON.parse(iframeContent.substring(1, iframeContent.length - 1)));
						});
					});
					document.body.appendChild(iframe);
				};

				$scope.loginSucceeded = setJiraProjects;

				$scope.loginCancelled = function () {
					$scope.jiraApp.value = "";
				};
			}
		])
		.controller("VersionsController", ["$scope", "$stateParams", "$timeout", "Restangular",
			"restTableModelService", "DATE_FORMAT",
			function ($scope, $stateParams, $timeout, Restangular, restTableModelService, DATE_FORMAT) {
				showMask(true, "Loading version list");
				var createVersionRowModel = function () {};

				var remove = function (process) {
					var html =
						"<span class='help-block text-center'>" +
						"Are you sure you want to delete the version of process " +
						"<strong>'" + process.comment + " (" + process.versionKey + ")'</strong>" +
						" that was created on <strong>" + process.createDate + "</strong>?" +
						"</span>";

					bootbox.confirm(html,
						function (result) {
							if (result) {
								showMask(true, "Deleting");
								process.remove().then(
									function () {
										createVersionRowModel();
									}
								);
							}
						}
					);
				};

				var setProcessVersionAsCurrent = function (process) {
					var createdMomentDate = moment(process.createDate, DATE_FORMAT);
					var updatedMomentDate = moment(process.updateDate, DATE_FORMAT);

					var updatedProcess = Restangular.copy(process);
					updatedProcess.createDate = createdMomentDate.toISOString();
					updatedProcess.updateDate = updatedMomentDate.toISOString();
					delete updatedProcess.iconClass;

					updatedProcess.put({
						"set-as-current": true
					}).then(
						function () {
							createVersionRowModel();
						}
					);
				};

				var showCompareVersionsDialog = function (processVersion) {
					$scope.compareVersions = {};
					$scope.compareVersions.success = false;
					$scope.compareVersions.originProcessVersion = Restangular.copy(processVersion);

					Restangular.one("processes", $stateParams.processId).getList("versions").then(
						function (targetProcessVersions) {
							$scope.compareVersions.targetProcessVersions = targetProcessVersions;
							//Removes the current process version entry from the possible target process versions
							//("compare to" process verisons)
							_.remove($scope.compareVersions.targetProcessVersions, {
								"versionKey": processVersion.versionKey
							});
						},
						function (response) {
							$scope.compareVersions.error = "Error " + response.status + ". Check log for more details";
						}
					);

					var modalHidden = function () {};
					modalHidden = function () {
						$scope.$apply(function () {
							if ($scope.compareVersions.success) {
								showMask(false);
								window.location.href = "process.html#/processes/" +
									$scope.compareVersions.originProcessVersion.processId +
									"/version/" + $scope.compareVersions.originProcessVersion.id + "/diff/" + $scope.compareVersions
									.targetProcessVersion.id;
							}
							delete $scope.compareVersions;
							$("#compareVersionsModal").off("hidden.bs.modal", modalHidden);
						});
					};

					$("#compareVersionsModal").modal("show").on("hidden.bs.modal", modalHidden);
				};

				$scope.submitCompareVersions = function () {
					$scope.compareVersions.success = true;
					$("#compareVersionsModal").modal("hide");
				};

				$scope.processSelectedCompareVersion = function () {
					delete $scope.compareVersions.error;
				};

				var download = function (process) {
					var fileUrl = getHostAndPort() + process.getRequestedUrl() + "/process-file";

					var iframe = document.createElement("iframe");
					iframe.setAttribute("src", fileUrl);
					iframe.setAttribute("style", "display: none");
					iframe.addEventListener("load", function () {
						$timeout(function () {
							var iframeContent = iframe.contentDocument.body.textContent;
							processesModule.processErrorMessageJson($scope,
								JSON.parse(iframeContent.substring(1, iframeContent.length - 1)));
						});
					});
					document.body.appendChild(iframe);
				};

				var downloadXMLManifest = function (process) {

					var fileUrl = getHostAndPort() + process.getRequestedUrl() + "/xmlmanifest";

					var iframe = document.createElement("iframe");
					iframe.setAttribute("src", fileUrl);
					iframe.setAttribute("style", "display: none");
					iframe.addEventListener("load", function () {
						$timeout(function () {
							var iframeContent = iframe.contentDocument.body.textContent;
							processesModule.processErrorMessageJson($scope,
								JSON.parse(iframeContent.substring(1, iframeContent.length - 1)));
						});
					});
					document.body.appendChild(iframe);
				};

				var downloadPDFManifest = function (process) {

					var fileUrl = getHostAndPort() + process.getRequestedUrl() + "/pdfmanifest";

					var iframe = document.createElement("iframe");
					iframe.setAttribute("src", fileUrl);
					iframe.setAttribute("style", "display: none");
					iframe.addEventListener("load", function () {
						$timeout(function () {
							var iframeContent = iframe.contentDocument.body.textContent;
							processesModule.processErrorMessageJson($scope,
								JSON.parse(iframeContent.substring(1, iframeContent.length - 1)));
						});
					});
					document.body.appendChild(iframe);
				};

				var showMoveProcessVersionDialog = function (processVersion) {
					$scope.moveVersion = {};
					$scope.moveVersion.processVersion = Restangular.copy(processVersion);

					Restangular.all("processes").getList().then(
						function (targetProcesses) {
							$scope.moveVersion.targetProcesses = targetProcesses;
							//Removes the current process entry from the possible target processes ("move to" processes)
							_.remove($scope.moveVersion.targetProcesses, {
								"title": $scope.process.title
							});
						},
						function (response) {
							$scope.moveVersion.error = "Error " + response.status + ". Check log for more details";
						}
					);

					var modalHidden = function () {
						$scope.$apply(function () {
							createVersionRowModel();
							delete $scope.moveVersion;
							$("#moveVersionModal").off("hidden.bs.modal", modalHidden);
						});
					};

					$("#moveVersionModal").modal("show").on("hidden.bs.modal", modalHidden);
				};

				var showCloneProcessVersionDialog = function (processVersion) {
					$scope.createProcess = {};
					$scope.createProcess.targetProcess = {};
					$scope.createProcess.sourceProcessVersion = Restangular.copy(processVersion);

					var modalHidden = function () {};
					modalHidden = function () {
						$scope.$apply(function () {
							if ($scope.createProcess.success) {
								showMask(false);
								window.location.href = "process.html#/processes";
							}
							delete $scope.createProcess;
							$("#cloneProcessVersionModal").off("hidden.bs.modal", modalHidden);
							showMask(false);
						});
					};

					$("#cloneProcessVersionModal").modal("show").on("hidden.bs.modal", modalHidden);
				};

				$scope.submitMoveVersion = function () {
					showMask(true, "Moving now");
					var processVersion = Restangular.copy($scope.moveVersion.processVersion);
					delete processVersion.iconClass;
					Restangular.one("processes", $scope.moveVersion.targetProcess.id).one("versions?sourceVersionId=" +
						processVersion.id).customPUT({},
						null, {}, {
							"Content-type": "application/json"
						}
					).then(
						function () {
							$("#moveVersionModal").modal("hide");
						},
						function () {
							showMask(false);
							$scope.moveVersion.error = "Process with the same version already exists on target process";
						}
					)
				};

				$scope.processSelectedMoveVersion = function () {
					delete $scope.moveVersion.error;
				}

				$scope.submitCreateProcess = function () {
					showMask(true);
					Restangular.one("processes").get({
						title: $scope.createProcess.targetProcess.title
					}).then(
						function (response) {
							if (response.elements.length === 0) {
								Restangular.one("processes")
									.customPOST($scope.createProcess.targetProcess,
										null, {}, {
											"Content-type": "application/json"
										})
									.then(
										function (process) {
											copyVersionToProcess(process.id, true);
										},
										function (response) {
											showMask(false);
											if (response.status === 400) {
												$scope.createProcess.error = "Process data (i.e. title) seems to be missing";
											} else {
												$scope.createProcess.error = "Process not uploaded. Check logs for more details";
											}
										}
									);
							} else {
								showMask(false);
								$scope.createProcess.error =
									"Process with the same title already exist. Please choose a different title";
								$scope.createProcess.alreadyUsedTitle = $scope.createProcess.targetProcess.title;
							}
						}
					);
				};

				var copyVersionToProcess = function (processId, deleteProcessOnVersionFail) {
					Restangular.one("processes", processId)
						.one("versions?sourceVersionId=" + $scope.createProcess.sourceProcessVersion.id).customPOST({},
							null, {}, {
								"Content-type": "application/json"
							}
						)
						.then(
							function (version) {
								$scope.createProcess.success = true;
								$("#cloneProcessVersionModal").modal("hide");
							},
							function (response) {
								showMask(false);
								if (response.status === 400) {
									$scope.createProcess.error = "Process version data (i.e. comment) seems to be missing";
								} else {
									$scope.createProcess.error = "Process version not uploaded. Check logs for more details";
								}
								if (deleteProcessOnVersionFail) {
									Restangular.one("processes", processId).remove();
								}
							}
						);
				}

				createVersionRowModel = function () {
					showMask(true, "Loading");
					$scope.processRowModel = restTableModelService.createRestTableModel(
						"processes/" + $stateParams.processId + "/versions",
						function (processVersion) {
							if ($scope.process !== undefined) {
								var defaultAction = {
									run: "process.html#/processes/" + processVersion.processId + "/version/" + processVersion.id
								};
								var actionObjects = [{
									name: "Set to current version",
									icon: "pushpin",
									class: "default",
									run: function (data) {
										setProcessVersionAsCurrent(data);
									}
								}, {
									name: "Compare to another version",
									icon: "duplicate",
									class: "default",
									run: function (data) {
										showCompareVersionsDialog(data);
									}
								}, {}, {
									name: "Deploy to JIRA",
									icon: "export",
									class: "default",
									run: "process.html#/processes/" + processVersion.processId + "/version/" + processVersion.id + "/deploy"
								}, {
									name: "Download",
									icon: "save",
									class: "default",
									run: function (data) {
										download(data);
									}
								}, {}, {
									name: "Inspect manifest",
									icon: "sunglasses",
									class: "default",
									run: "process.html#/processes/" + processVersion.processId + "/version/" + processVersion.id + "/manifest"
								}, {
									name: "Download XML manifest",
									icon: "list-alt",
									class: "default",
									run: function (data) {
										downloadXMLManifest(data);
									}
								}, {
									name: "Download PDF manifest",
									icon: "text-background",
									class: "default",
									run: function (data) {
										downloadPDFManifest(data);
									}
								}, {
									name: "Clone to new process",
									icon: "file",
									class: "default",
									run: function (data) {
										showCloneProcessVersionDialog(data);
									}
								}, {
									name: "Move to existing process",
									icon: "share-alt",
									class: "default",
									run: function (data) {
										showMoveProcessVersionDialog(data);
									}
								}, {}, {
									name: "Edit",
									icon: "pencil",
									class: "default",
									run: "process.html#/processes/" + processVersion.processId + "/version/" + processVersion.id
								}, {
									name: "Delete",
									icon: "trash",
									class: "default",
									run: function (data) {
										remove(data);
									}
								}];

								processVersion.iconClass = processVersion.current ? "glyphicon glyphicon-pushpin" : "";

								processVersion.createDate = moment(processVersion.createDate).format(DATE_FORMAT);
								if (processVersion.updateDate === null) {
									processVersion.updateDate = processVersion.createDate;
								} else {
									processVersion.updateDate = moment(processVersion.updateDate).format(DATE_FORMAT);
								}
								return {
									data: processVersion,
									actions: actionObjects,
									defaultAction: defaultAction
								};
							}
						}
					);
				};

				var retrieveProcess = function (processId) {
					Restangular.one("processes", processId).get().then(
						function (process) {
							$scope.addActions = [{
								name: "Extract from JIRA",
								icon: "import",
								run: "process.html#/processes/" + process.id + "/version/extract"
							}, {
								name: "Upload",
								icon: "open",
								run: "process.html#/processes/" + process.id + "/version/upload"
							}];
							$scope.process = process;
							createVersionRowModel();
						},
						function () {
							$scope.error = "Requested process does not seem to exist";
						}
					);
				};

				retrieveProcess($stateParams.processId);
			}
		])
		.controller("ExtractController", ["$scope", "$stateParams", "Restangular", "arrayTableModelService",
			function ($scope, $stateParams, Restangular, arrayTableModelService) {
				if (!$.fx.off) {
					$("#pluginsModal").addClass("fade");
					$("#customFieldsModal").addClass("fade");
				}
				$scope.defaultTitle = undefined;
				//Max length is 250 characters because just before submitting the process we"re adding 5 characters
				//to the end of $scope.process.name: ".spec". If the length of the final filename is bigger than 255
				//we"ll have an Internal Server Error
				var maxFileNameLength = 250;

				$scope.jiraApp = {};
				$scope.jiraProject = {};
				$scope.process = {};
				$scope.version = {};

				Restangular.one("application/installed-application").getList("jira-application").then(
					function (jiraApps) {
						$scope.jiraApps = _.filter(jiraApps, function(jiraApp) {
							return jiraApp.linkConfigured;
						});
					},
					function (response) {
						processesModule.createErrorHandler($scope, response);
					}
				);

				processesModule.retrieveProcess($scope, $stateParams, Restangular);

				var setJiraProjects = function () {
					if ($scope.jiraApp.value !== null) {
						Restangular.one("processmanager/jira-apps", $scope.jiraApp.value.id).getList("projects").then(
							function (jiraProjects) {
								$scope.jiraProjects = jiraProjects;
								showMask(false);
							},
							function (response) {
								showMask(false);
								processesModule.createErrorHandler($scope, response);
								$scope.jiraApp = {};
							}
						);
					} else {
						showMask(false);
					}
				};

				$scope.titleChanged = function () {
					// Process title restricted to 250 characters, as for the maxFileNameLength string in ExtractController
					$scope.process.title = $scope.process.title.substring(0, 250);
					generateFileName();
				};

				var generateFileName = function () {
					var suffix = "_" +
						$scope.jiraProject.value.name.toUpperCase() +
						"-" +
						$scope.jiraApp.value.name.toUpperCase();

					var fileName = $scope.process.title + suffix;
					if (fileName.length > maxFileNameLength) {
						$scope.process.title = $scope.process.title.substring(0, maxFileNameLength - suffix.length);
						fileName = $scope.process.title + suffix;
					}

					$scope.version.fileName = fileName.replace(/ /g, "_");
				};

				var normaliseProcessFileName = function () {
					$scope.version.fileName = $scope.version.fileName.replace(/ /g, "_");
				};

				$scope.toggleAllPluginSelection = function () {
					_.forEach($scope.plugins, function (plugin) {
						plugin.selected = $scope.selectAllPlugins;
					});
				};

				$scope.toggleAllCustomFieldSelection = function () {
					_.forEach($scope.customFields, function (customField) {
						customField.selected = $scope.selectAllCustomFields;
					});
				};

				$scope.selectedJira = function () {
					delete $scope.jiraProject.value;
					delete $scope.jiraProjects;
					delete $scope.plugins;
					delete $scope.customFields;
					delete $scope.error;
					$scope.titleValid = true;
					setJiraProjects();
				};

				$scope.projectSelected = function () {
					delete $scope.error;
					delete $scope.plugins;
					delete $scope.customFields;
					delete $scope.selectAllCustomFields;

					retrievePlugins();

					generateFileName();
				};

				var retrievePlugins = function () {
					Restangular.one("processmanager/jira-apps", $scope.jiraApp.value.id).getList("plugins")
						.then(
							function (plugins) {
								$scope.plugins = [];
								_.forEach(plugins, function (plugin) {
									// We need to add an id property to the plugin objects because spectrum selector
									// requires it to work properly
									plugin["id"] = plugin["key"];
									$scope.plugins.push(plugin);
								});
								showMask(false);
							},
							function (response) {
								delete $scope.jiraProject.value;
								processesModule.createErrorHandler($scope, response);
							}
						);
				};

				$("#pluginsModal").on("hidden.bs.modal", function () {
					showMask(true, "Retreiving plugins from JIRA");
					$scope.$apply(function () {
						retrievePlugins();
					});

				});

				$scope.extractStepOne = function () {
					delete $scope.extractOptionsError;
					showMask(true, "Extracting from JIRA");
					Restangular.one("processmanager/jira-apps", $scope.jiraApp.value.id)
						.one("projects", $scope.jiraProject.value.key).getList("unreferencedGlobalCustomFields")
						.then(
							function (customFields) {
								$scope.customFields = customFields;
								setPreviousExtractOption();
								Restangular.all("processes")
									.getList({
										"last-sequence-only": true,
										title: $scope.process.title
									})
									.then(
										function (processes) {
											showMask(false);
											if (processes.length === 0 ||
												$scope.defaultTitle !== undefined) {
												normaliseProcessFileName();
												if ($scope.plugins[0] != null) {
													$("#pluginsModal").modal("show");
												} else {
													$scope.extractStepTwo();
												}
											} else {
												$scope.error = "Process with the same title already exists";
												$scope.titleValid = false;
											}
										},
										function (response) {
											processesModule.createErrorHandler($scope, response);
										}
									);
							},
							function (response) {
								delete $scope.jiraProject.value;
								processesModule.createErrorHandler($scope, response);
							}
						);
				}

				var setPreviousExtractOption = function () {
					var selectedPlugins = [];
					var unselectedPlugins = [];
					var selectedCustomFields = [];
					var unselectedCustomFields = [];
					if ($stateParams.processId) {
						Restangular.one("processes", $stateParams.processId).getList("plugins", {
							"required-only": true
						}).then(
							function (processPlugins) {
								_.forEach($scope.plugins, function (plugin) {
									if (_.some(processPlugins, {
											"key": plugin.key
										})) {
										selectedPlugins.push(plugin);
									} else {
										unselectedPlugins.push(plugin);
									}
								});
								setPluginSelectorData(unselectedPlugins, selectedPlugins);
							},
							function () {
								$scope.extractOptionsError = "Error trying to retrieve previous plugins options. Check " +
									"Spectrum logs for more details";
							}
						);
						Restangular.one("processes", $stateParams.processId).getList("custom-fields").then(
							function (processCustomFields) {
								_.forEach($scope.customFields, function (customField) {
									if (_.some(processCustomFields, {
											"name": customField.name,
											"typeKey": customField.typeKey
										})) {
										selectedCustomFields.push(customField);
									} else {
										unselectedCustomFields.push(customField);
									}
								});
								setCustomFieldSelectorData(unselectedCustomFields, selectedCustomFields);
							},
							function () {
								$scope.extractOptionsError = "Error trying to retrieve previous custom fields options. " +
									"Check Spectrum logs for more details";
							}
						);
					} else {
						setPluginSelectorData($scope.plugins, selectedPlugins);
						setCustomFieldSelectorData($scope.customFields, selectedCustomFields);
					}
				};

				var setPluginSelectorData = function (unselectedPlugins, selectedPlugins) {
					var tableRowLimit = 0;
					$scope.selectedPlugins = arrayTableModelService.createArrayTableModel(
						selectedPlugins,
						function (plugin) {
							return {
								data: plugin,
								actions: []
							};
						}, true, ['name'], tableRowLimit);
					$scope.unselectedPlugins = arrayTableModelService.createArrayTableModel(
						unselectedPlugins,
						function (plugin) {
							return {
								data: plugin,
								actions: []
							};
						}, true, ['name'], tableRowLimit);
				};

				var setCustomFieldSelectorData = function (unselectedCustomFields, selectedCustomFields) {
					var tableRowLimit = 0;
					$scope.selectedCustomFields = arrayTableModelService.createArrayTableModel(
						selectedCustomFields,
						function (customField) {
							return {
								data: customField,
								actions: []
							};
						}, true, ['name'], tableRowLimit);
					$scope.unselectedCustomFields = arrayTableModelService.createArrayTableModel(
						unselectedCustomFields,
						function (customField) {
							return {
								data: customField,
								actions: []
							};
						}, true, ['name'], tableRowLimit);
				};

				$scope.extractStepTwo = function () {
					if ($scope.customFields[0] != null) {
						$("#customFieldsModal").modal("show");
					} else {
						$scope.extractStepThree();
					}
				}

				$scope.extractStepThree = function () {
					showMask(true, "Finalising extraction");
					if ($scope.defaultTitle === undefined) {
						Restangular.one("processes").customPOST(
								$scope.process, null, {}, {
									"Content-type": "application/json"
								}
							)
							.then(
								function (process) {
									extractProcessVersion(process.id);
								},
								function (response) {
									if (response.status === 400) {
										$scope.error = response.data.message;
									} else {
										$scope.error = "Process not extracted. Check logs for more details";
									}
								}
							);
					} else {
						extractProcessVersion($stateParams.processId);
					}

				};

				var extractProcessVersion = function (processId) {
					showMask(true, "Finalising extraction");

					$scope.version.processId = processId;

					var processVersion = _.defaults({
						fileName: $scope.version.fileName + ".spec"
					}, $scope.version);
					var selectedCustomFieldIds = _.pluck($scope.selectedCustomFields.undecoratedRows, "id");
					var selectedPluginKeys = _.pluck($scope.selectedPlugins.undecoratedRows, "key");

					Restangular.one("processmanager/jira-apps", $scope.jiraApp.value.id)
						.one("projects", $scope.jiraProject.value.key)
						.customPOST({
							processVersion: processVersion,
							selectedPluginKeys: selectedPluginKeys,
							selectedCustomFieldIds: selectedCustomFieldIds
						}, "exporter")
						.then(function (processVersion) {
							showMask(false);
							if ($scope.defaultTitle !== undefined) {
								window.location.href = "process.html#/processes/" + processVersion.processId + "/version";
							} else {
								window.location.href = "process.html#/processes";
							}
						}, function (response) {
							if ($scope.defaultTitle === undefined) {
								Restangular.one("processes", processId).remove();
							}
							processesModule.createErrorHandler($scope, response);
						});

					// The following line of code was added because occasionally the modal backdrop is not being removed
					// after a modal is closed. It might be a Bootstrap 3.3.4 bug, we should test it later, in later
					// versions.
					$(".modal-backdrop").remove();
				};

				$scope.loginSucceeded = setJiraProjects;

				$scope.loginCancelled = function () {
					$scope.jiraApp.value = "";
				};
			}
		])
		.controller("EditProcessController", ["$scope", "$stateParams", "Restangular",
			function ($scope, $stateParams, Restangular) {
				var retrieveProcess = function () {
					Restangular.one("processes", $stateParams.processId).get().then(
						function (process) {
							if (process.updateDate === null) {
								process.updateDate = process.createDate;
							}
							$scope.process = process;
						},
						function () {
							$scope.error = "Requested process does not seem to exist";
						}
					);
				};

				$scope.updateProcess = function (processVersion) {
					processVersion.put().then(
						function () {
							window.location.href = "process.html#/processes";
						}
					);
				};

				$scope.saveProcessTitle = function () {
					Restangular.one("process-titles", $scope.changeProcessTitle.process.title)
						.customPUT($scope.changeProcessTitle.newProcessTitle, null, {}, {
							"Content-type": "text/plain"
						})
						.then(
							function () {
								$("#changeProcessTitleModal").modal("hide");
								createProcessRowModel();
								delete $scope.changeProcessTitle;
							},
							function () {
								$scope.changeProcessTitle.error =
									"Submitted process title seems to already exist. Please choose a new title";
								$scope.changeProcessTitle.alreadyUsedTitle = $scope.changeProcessTitle.newProcessTitle;
							}
						);
				};

				retrieveProcess();
			}
		])
		.controller("EditProcessVersionController", ["$scope", "$stateParams", "Restangular",
			function ($scope, $stateParams, Restangular) {
				var retrieveProcess = function () {
					Restangular.one("processes", $stateParams.processId).one("versions", $stateParams.versionId).get().then(
						function (processVersion) {
							if (processVersion.updateDate === null) {
								processVersion.updateDate = processVersion.createDate;
							}
							$scope.processVersion = processVersion;
						},
						function () {
							$scope.error = "Requested process version does not seem to exist";
						}
					);
				};

				$scope.updateProcessVersion = function (processVersion) {
					processVersion.put({
						"set-as-current": processVersion.current
					}).then(
						function () {
							window.location.href = "process.html#/processes/" + processVersion.processId + "/version";
						}
					);
				};

				retrieveProcess();
			}
		])
		.controller("UploadController", ["$scope", "$stateParams", "Restangular",
			function ($scope, $stateParams, Restangular) {
				$scope.defaultTitle = undefined;
				$scope.titleValid = true;
				$scope.process = {};
				$scope.version = {};
				processesModule.retrieveProcess($scope, $stateParams, Restangular);

				$scope.fileChanged = function (element) {
					$scope.$apply(function () {
						$scope.fileChosen = true;

						var fileName = element.files[0].name;
						$scope.version.fileName = fileName;

						if (fileName.endsWith(".spec")) {
							$scope.fileValid = true;
							delete $scope.error;
						} else {
							$scope.fileValid = false;
							$scope.error = "Process file '" + fileName + "' does not seem to be valid";
						}
					});
				};

				$scope.titleChanged = function () {
					// Process title restricted to 250 characters, as for the maxFileNameLength string in ExtractController
					$scope.process.title = $scope.process.title.substring(0, 250);
				};

				$scope.upload = function () {
					showMask(true, "Uploading SPEC file");
					delete $scope.error;
					Restangular.one("processes").get({
						title: $scope.process.title
					}).then(
						function (response) {
							if (response.elements.length === 0) {
								if ($scope.defaultTitle === undefined) {
									Restangular.one("processes")
										.customPOST($scope.process, null, {}, {
											"Content-type": "application/json"
										})
										.then(
											function (process) {
												showMask(false);
												uploadVersion(process.id, true);
											},
											function (response) {
												showMask(false);
												if (response.status === 400) {
													$scope.error = "Process or version data is missing";
												} else {
													$scope.error = "Process not uploaded. Check logs for more details";
												}
											}
										);
								}
							} else {
								if ($scope.defaultTitle !== undefined) {
									uploadVersion($stateParams.processId, false);
								} else {
									$scope.error = "Process with the same title already exists";
									$scope.titleValid = false;
									showMask(false);
								}
							}
						}
					);
				};

				var uploadVersion = function (processId, deleteProcessOnVersionFail) {
					var processFile = document.getElementById("file-spec-select-process-file").files[0];
					var formData = new FormData();
					formData.append("processVersion", angular.toJson($scope.version));
					formData.append("file", processFile);
					// We need to switch off the normal angular transformations lest they try to turn the
					//formdata object into a single piece of JSON.  Setting the transformer to an identity
					//function means no transformations will take place.
					Restangular.one("processes", processId).one("versions").withHttpConfig({
							transformRequest: angular.identity
						})
						.customPOST(formData, null, {}, {
							"Content-type": undefined
						})
						.then(
							function (processVersion) {
								showMask(false);
								if ($scope.defaultTitle !== undefined) {
									window.location.href = "process.html#/processes/" + processVersion.processId + "/version";
								} else {
									window.location.href = "process.html#/processes";
								}
							},
							function (response) {
								showMask(false);
								if (response.status === 400) {
									$scope.error = response.data.message;
								} else {
									$scope.error = "Process version not uploaded. Check logs for more details";
								}
								if (deleteProcessOnVersionFail) {
									Restangular.one("processes", processId).remove();
								}
							}
						);
				}
			}
		])
		.controller("ManifestController", ["$scope", "$stateParams", "Restangular",
			function ($scope, $stateParams, Restangular, angularBootstrapNavTree) {
				showMask(true, "Loading manifest data");
				$scope.manifestData = [];

				var retrieveProcess = function () {
					Restangular.one("processes", $stateParams.processId).get().then(
						function (process) {
							$scope.process = process;
						},
						function () {
							showMask(false);
							$scope.error = "Process does not seem to exist";
						}
					);
				};

				var retrieveProcessVersion = function () {
					showMask(true, "Loading");
					if ($stateParams.versionId !== undefined) {
						Restangular.one("processes", $stateParams.processId).one("versions", $stateParams.versionId).get().then(
							function (processVersion) {
								$scope.version = processVersion;
							},
							function () {
								showMask(false);
								$scope.error = "Process version does not seem to exist";
							}
						);
					} else {
						Restangular.one("processes", $stateParams.processId).one("current-version").get().then(
							function (processVersion) {
								$scope.version = processVersion;
							},
							function () {
								showMask(false);
								$scope.error = "Process version does not seem to exist";
							}
						);
					}
				};

				var convertXmlToAbnTreeNodeStructure = function (xmlElement) {
					var returnData = [];
					for (var i = 0; i < xmlElement.childNodes.length; i++) {
						var xmlChildElement = xmlElement.childNodes[i];
						if (xmlChildElement === null || xmlChildElement.nodeName === "source") {
							continue;
						}
						if (simpleXmlContent(xmlChildElement)) {
							returnData.push({
								label: deCamelCase(xmlChildElement.nodeName),
								children: [xmlChildElement.textContent]
							});
						} else if (inXmlArray(xmlChildElement)) {
							var itemName = null;
							for (var j = 0; j < xmlChildElement.childNodes.length; j++) {
								if (xmlChildElement.childNodes[j].nodeName === "name" || xmlChildElement.childNodes[j].nodeName ===
									"fileName") {
									itemName = xmlChildElement.childNodes[j].textContent;
									xmlChildElement.removeChild(xmlChildElement.childNodes[j]);
								}
							}
							if (itemName === null || itemName === "") {
								itemName = deCamelCase(xmlChildElement.nodeName);
							}
							returnData.push({
								label: itemName,
								children: convertXmlToAbnTreeNodeStructure(xmlChildElement)
							});
						} else {
							returnData.push({
								label: deCamelCase(xmlChildElement.nodeName),
								children: convertXmlToAbnTreeNodeStructure(xmlChildElement)
							});
						}
					}
					return returnData;
				}

				var retrieveProcessManifest = function () {
					showMask(true, "Loading");
					var restRequest = Restangular.one("processes", $stateParams.processId);
					if ($stateParams.versionId !== undefined) {
						restRequest = Restangular.one("processes", $stateParams.processId).one("versions", $stateParams.versionId);
					}
					restRequest.one("xmlmanifest").get().then(
						function (xmlData) {
							var xmlManifest = parseXml(xmlData);
							$scope.manifestData = convertXmlToAbnTreeNodeStructure(xmlManifest.documentElement);
							showMask(false);
						},
						function () {
							showMask(false);
							$scope.error = "Process manifest could not be downloaded";
						}
					);
				};

				retrieveProcess();
				retrieveProcessVersion();
				retrieveProcessManifest();
			}
		])
		.directive("bindCompile", ["$compile", function ($compile) {
			//This lovely directive lets us bind HTML to a template element allowing for use of directives like ng-click inside the bound HTML
			//Without this, using ng-click in the HTML that is output for the diff accordion structure is impossible

			//usage: wherever you'd normally use 'ng-bind-html="someData"', use 'bind-compile="someData"' instead
			//Note : ONLY NECESSARY when someData is HTML which contains references to other directives like "ng-click"
			//Note : unlike the HTML passed to "ng-bind-html", someData does NOT needed to be trusted with the "$sce.trustAsHtml" method
			//          as $compile() implicitly trusts someData since it has now been compiled as a template by Angular itself

			return function ($scope, element, attrs) {
				$scope.$watch(
					function ($scope) {
						return $scope.$eval(attrs.bindCompile);
					},
					function ($value) {
						element.html($value);
						$compile(element.contents())($scope);
					}
				)
			}
		}])
		.controller("DiffController", ["$scope", "$stateParams", "$timeout", "Restangular",
			function ($scope, $stateParams, $timeout, Restangular) {
				//used in convertXmlToManifestDiffDataHtmlStructure in determining whether or not we need to output a new
				//  accordion structure when creating a new set of panels
				//starts at -1 so that the first call to the function has diffRecursionLevel === 0
				//  this lets me exclude the top-level panels from any special treatment as their accordion wrapper is
				//  defined in the template
				var diffRecursionLevel = -1;

				showMask(true, "Loading differences");
				var retrieveProcess = function () {
					Restangular.one("processes", $stateParams.processId).get().then(
						function (process) {
							$scope.process = process;
							retrieveProcessVersions();
						},
						function () {
							$scope.error = "Process does not seem to exist";
						}
					);
				};

				var retrieveProcessVersions = function () {
					Restangular.one("processes", $stateParams.processId).one("versions", $stateParams.versionId).get().then(
						function (processVersion) {
							$scope.version = processVersion;
							Restangular.one("processes", $stateParams.processId).one("versions", $stateParams.compareWithVersionId).get().then(
                                function (processVersion) {
                                    $scope.compareWithVersion = processVersion;
                                    retrieveProcessManifestDiff();
                                },
                                function () {
                                    $scope.error = "Requested compare with version does not seem to exist";
                                }
                            );
						},
						function () {
							$scope.error = "Requested version does not seem to exist";
						}
					);
				};

				var convertXmlToManifestDiffDataHtmlStructure = function (xmlElement) {
					diffRecursionLevel++;

					var diffHtml = "";
					var deltaElements = [];
					var objectElements = [];
					var nestedObjectElements = [];
					for (var i = 0; i < xmlElement.childNodes.length; i++) {
						var childElement = xmlElement.childNodes[i];
						if (childElement.nodeName === "delta") {
							deltaElements.push(childElement);
						} else if (childElement.nodeName === "object") {
							var childOnlyContainsObjectElements = true;
							for (var j = 0; j < childElement.childNodes.length; j++) {
								var grandchildElement = childElement.childNodes[j];
								if (grandchildElement.nodeName === "delta") {
									childOnlyContainsObjectElements = false;
								}
							}
							if (childOnlyContainsObjectElements) {
								nestedObjectElements.push(childElement);
							} else {
								objectElements.push(childElement);
							}
						}
					}
					if (deltaElements.length > 0) {
						if (xmlElement.getAttribute("name") === "Fields") {
							diffHtml = diffHtml + "<table>";
							var templateFieldData = deltaElements[0].textContent.split(", ");
							diffHtml = diffHtml + "<tr>";
							for (var j = 0; j < templateFieldData.length; j++) {
								diffHtml = diffHtml + "<th>" + templateFieldData[j].split(": ")[0] + "</th>";
							}
							diffHtml = diffHtml + "</tr>";
							for (var i = 0; i < deltaElements.length; i++) {
								var deltaElement = deltaElements[i];
								var fieldData = deltaElement.textContent.split(", ");
								diffHtml = diffHtml + "<tr>";
								for (var j = 0; j < fieldData.length; j++) {
									if (deltaElement.getAttribute("status") === "noChange") {
										diffHtml = diffHtml + "<td>" + fieldData[j].split(": ")[1] + "</td>";
									} else if (deltaElement.getAttribute("status") === "removed") {
										diffHtml = diffHtml + "<td><del>" + fieldData[j].split(": ")[1] + "</del></td>";
									} else if (deltaElement.getAttribute("status") === "added") {
										diffHtml = diffHtml + "<td><ins>" + fieldData[j].split(": ")[1] + "</ins></td>";
									}
								}
								diffHtml = diffHtml + "</tr>";
							}
							diffHtml = diffHtml + "</table>";
						} else {
							for (var i = 0; i < deltaElements.length; i++) {
								var deltaElement = deltaElements[i];
								if (deltaElement.getAttribute("status") === "noChange") {
									diffHtml += "<p>" + deltaElement.textContent + "</p>";
								} else if (deltaElement.getAttribute("status") === "removed") {
									diffHtml += "<p><del>" + deltaElement.textContent + "</del></p>";
								} else if (deltaElement.getAttribute("status") === "added") {
									diffHtml += "<p><ins>" + deltaElement.textContent + "</ins></p>";
								}
							}
						}
					}
					if (objectElements.length > 0) {
						for (var i = 0; i < objectElements.length; i++) {
							var objectElement = objectElements[i];
							diffHtml = diffHtml + "<h4>" + objectElement.getAttribute("name") + "</h4>";
							diffHtml = diffHtml + convertXmlToManifestDiffDataHtmlStructure(objectElement);
						}
					}

					if (nestedObjectElements.length > 0) {
						var dataParent = "accordion";
						if (diffRecursionLevel > 0) {
							//if we're not outputting the top-most panels

							//generate a 4-char unique identifier for the accordion id + sub-panel's data-parents
							var uniqueString = "";
							for (var i = 0; i < 4; i++) {
								uniqueString += String.fromCharCode(65 + Math.floor(Math.random() * 26));
							}

							dataParent = "new-accordion-" + uniqueString;
							diffHtml += "<div class='panel-group cv-accordion' id='" + dataParent +
								"' role='tablist' aria-multiselectable='true'>";
						}

						for (var i = 0; i < nestedObjectElements.length; i++) {
							var nestedObjectElement = nestedObjectElements[i];


							var nameNormal = nestedObjectElement.getAttribute("name")
								.replace(/((?![a-z|A-Z|0-9]).)/g, "")
								.toLowerCase();
							var uniqueStringForThisElement = "";
							for (var j = 0; j < 4; j++) {
								uniqueStringForThisElement += String.fromCharCode(65 + Math.floor(Math.random() * 26))
							}
							var name = nameNormal + uniqueStringForThisElement;

							diffHtml += "<div class='panel panel-default'>";

							diffHtml += "<div ng-click='accordionClicked(\"" + name +
								"\")' class='panel-heading' role='tab' id='heading-" + name + "' data-toggle='collapse' data-parent='#" +
								dataParent + "' data-target='#collapse-" + name + "'>";
							diffHtml += "<h4 class='panel-title'>";
							diffHtml += nestedObjectElement.getAttribute("name");
							diffHtml += "</h4>";
							diffHtml += "</div>";

							diffHtml += "<div id='collapse-" + name + "' class='panel-collapse collapse' role='tabpanel'>";
							diffHtml += "<div class='panel-body'>";
							diffHtml += convertXmlToManifestDiffDataHtmlStructure(nestedObjectElement);
							diffHtml += "</div>";
							diffHtml += "</div>";

							diffHtml += "</div>";
						}

						if (diffRecursionLevel > 0) {
							diffHtml += "</div>";
						}
					}
					diffRecursionLevel--;
					return diffHtml;
				}

				var retrieveProcessManifestDiff = function () {
					Restangular.one("processes", $stateParams.processId)
						.one("versions", $stateParams.versionId)
						.one("manifestdiff?compareWithVersionId=" + $stateParams.compareWithVersionId)
						.get().then(
							function (xmlData) {
								var xmlManifestDiff = parseXml(xmlData);
								$scope.manifestDiffData = convertXmlToManifestDiffDataHtmlStructure(xmlManifestDiff.documentElement);

								$timeout(function () {
									showMask(false);
								});
							},
							function () {
								$scope.error = "Process diff could not be processed";
							}
						);
				};

				$scope.accordionClicked = function (name) {
					$("#collapse-" + name + " .cv-accordion div.panel-collapse").each(function () {
						//for every accordion panel that is nested inside the clicked one
						//if they're expanded; collapse them

						if ($(this).hasClass("in")) {
							$(this).removeClass("in");
						}
					});
				};

				$scope.manifestDiffData = "<br/><p>Loading...</p><p>Please wait.</p>";
				retrieveProcess();
			}
		])
		.controller("DeployController", ["$scope", "$stateParams", "Restangular",
			function ($scope, $stateParams, Restangular) {
				var jobId;

				$scope.jiraApp = {};
				$scope.jiraProjectType = {};
                $scope.jiraProjectType.value = "";
				$scope.jiraProjectTypes = {};
				$scope.deployInProgress = false;

				Restangular.one("processes", $stateParams.processId).get().then(
					function (process) {
						$scope.process = process;
					},
					function () {
						$scope.error = "Process file does not seem to exist";
					}
				);

				if ($stateParams.versionId !== undefined) {
					Restangular.one("processes", $stateParams.processId).one("versions", $stateParams.versionId).get({ includeMetadata: true }).then(
						function (processVersion) {
							$scope.version = processVersion;
                            $scope.defaultProjectTypeKey = processVersion.projectTypeKey || null;
						},
						function () {
							$scope.error = "Process version does not seem to exist";
						}
					);
				} else {
					Restangular.one("processes", $stateParams.processId).one("current-version").get({ includeMetadata: true }).then(
						function (processVersion) {
							$scope.version = processVersion;
                            $scope.defaultProjectTypeKey = processVersion.projectTypeKey || null;
						},
						function () {
							$scope.error = "Process version does not seem to exist";
						}
					);
				}

				Restangular.one("application/installed-application").getList("jira-application").then(
					function (jiraApps) {
						$scope.jiraApps = _.filter(jiraApps, function(jiraApp) {
							return jiraApp.linkConfigured;
						});
					}
				);

				var setProblemsModal = function (state) {
					$("#problemsModal").modal(state ? "show" : "hide");
				};

				var resetDeploy = function () {
					$scope.jiraApp.value = "";
					$scope.jiraProjectType.value = {};
					$scope.deployInProgress = false;
					delete $scope.pluginError;
					delete $scope.pluginWarning;
					delete $scope.problems;
					setProblemsModal(false);
				};

				var getErrorsCount = function () {
					var problemsWithErrors = _.filter($scope.problems, function (problem) {
						if (problem.solution !== undefined && problem.solution.error !== undefined) {
							return problem.solution.error;
						}
					});
					return problemsWithErrors.length;
				};

				var handleFailedRequest = function (response) {
					if (response.status === 400) {
						$scope.problems = response.data;
						if (_.any(response.data, "fatal")) {
							response.data = _.filter($scope.problems, "fatal");
							processesModule.createErrorHandler($scope, response);
							resetDeploy();
						} else {
							if (getErrorsCount() !== 0) {
								$scope.duplicateError = true;
							}
							setProblemsModal(true);
						}
					} else {
						processesModule.createErrorHandler($scope, response);
						resetDeploy();
					}
				};

				$scope.deploy = function () {
					showMask(true, "Connecting to JIRA");
					$scope.waitingForServer = true;
					$scope.duplicateError = false;
					Restangular.withConfig(
							function (RestangularConfigurer) {
								RestangularConfigurer.setFullResponse(true);
							}
						)
						.one("processmanager/jira-apps", $scope.jiraApp.value.id)
						.customPOST({projectTypeKey: $scope.jiraProjectType.value.key, version:$scope.version},
						"importer/jobs", {}, {
							"Content-type": "application/json"
						})
						.then(
							function (response) {
								showMask(false);
								$scope.waitingForServer = false;
								if (response.status === 204) {
									$scope.success = true;
									resetDeploy();
								} else if (response.status === 201) {
									$scope.deployInProgress = true;
									$scope.problems = [];

									// Gets the job id from the location header
									var urlParts = response.headers("Location").split("/");
									jobId = _.last(urlParts);

									if (response.data[0].type === 'PLUGINS_NOT_ENABLED') {
										$scope.pluginError = response.data[0].message;
									} else if (response.data[0].type === 'PLUGIN_VERSIONS_NOT_EQUAL') {
										$scope.pluginWarning = response.data[0].message;
									} else {
										$scope.problems = response.data;
										setProblemsModal(true);
									}
								}
							},
							function (response) {
								showMask(false);
								$scope.waitingForServer = false;
								handleFailedRequest(response);
								$scope.jiraApp = {};
							}
						);
				};

				$scope.resetDeploy = resetDeploy;

				$("#problemsModal").on("hidden.bs.modal", function () {
					$scope.$apply(function () {
						resetDeploy();
					});
				});

				$scope.update = function () {
					delete $scope.pluginError;
					delete $scope.pluginWarning;
					$scope.waitingForServer = true;
					$scope.duplicateError = false;
					showMask(true, "Deploying to JIRA");
					var postData = {
						projectTypeKey: $scope.jiraProjectType.value.key,
						version: $scope.version.processId
					};

					Restangular.one("processmanager/jira-apps", $scope.jiraApp.value.id).one("importer/jobs", jobId)

						.customPUT($scope.problems, null, postData, {
							"Content-type": "application/json"
						})
						.then(
							function () {
								showMask(false);
								$scope.waitingForServer = false;
								$scope.success = true;
								resetDeploy();
							},
							function (response) {
								showMask(false);
								$scope.waitingForServer = false;
								handleFailedRequest(response);
							}
						);
				};

				$scope.createNewSelected = function (problem) {
					problem.solution.type = "CREATE_NEW";
					problem.solution.details = {
						name: problem.details.name
					};
				};

				$scope.reuseExistingSelected = function (problem) {
					problem.solution.type = "REUSE_EXISTING";
					delete problem.solution.details;
				};

				$scope.reuseAllExistingSelection = function(problems) {
                    if (problems) {
                        problems.forEach(function(problem) {
                            if (!problem.solution) {
	                            problem.solution = {};
	                        }
                            $scope.reuseExistingSelected(problem);
                        });
                    }
                };

                $scope.createAllNewSelection = function(problems) {
                    if (problems) {
                        problems.forEach(function(problem) {
                            if (!problem.solution) {
                                problem.solution = {};
                            }
							// if create new was selected before, we don't change it
                            if (problem.solution.type != "CREATE_NEW") {
	                            $scope.createNewSelected(problem);
	                            problem.solution.details.name = 'New_' + problem.details.name;
	                        }
                        });
                    }
                };


				$scope.jiraSelected = function () {
				    $scope.defaultProjectTypeNotFound = false;
					if ($scope.jiraApp.value !== null) {
						Restangular.one("processmanager/jira-apps", $scope.jiraApp.value.id).getList("projectTemplate/types").then(
                            function (jiraProjectTypes) {
                                $scope.jiraProjectTypes = jiraProjectTypes;

                                if ($scope.defaultProjectTypeKey) {
                                    var defaultProjectTypeObject;
                                    $scope.jiraProjectTypes.forEach(function(jiraProjectType) {
                                        if ($scope.defaultProjectTypeKey == jiraProjectType.key) {
                                            defaultProjectTypeObject = jiraProjectType;
                                        }
                                    });

                                    if (defaultProjectTypeObject) {
                                        $scope.jiraProjectType.value = defaultProjectTypeObject;
                                    } else {
                                        $scope.defaultProjectTypeNotFound = true;
                                    }
                                }

                                showMask(false);
                            }, function (response) {
								showMask(false);
								processesModule.createErrorHandler($scope, response);
								$scope.jiraApp = {};
							}
						);
					}

					delete $scope.error;
					delete $scope.pluginError;
					delete $scope.pluginWarning;
					$scope.success = false;
				};

				$scope.problemsWithoutSolutionsExist = function () {
					return !_.every($scope.problems, "solution");
				};

				$scope.acknowledgeDeploy = function () {
					if ($stateParams.versionId !== undefined) {
						window.location.href = "process.html#/processes" + $stateParams.processId + "/version";
					} else {
						window.location.href = "process.html#/processes";
					}
				}

				$scope.prettifyProjectTypeKey = function(projectTypeKey) {
					var prettifiedProjectTypeKey = "";
					projectTypeKey.split("_").forEach(function(projectTypeKeyElement) {
						if (prettifiedProjectTypeKey !== "") {
							prettifiedProjectTypeKey = prettifiedProjectTypeKey.concat(" ");
						}
						prettifiedProjectTypeKey = prettifiedProjectTypeKey.concat(
							projectTypeKeyElement.charAt(0).toUpperCase() + projectTypeKeyElement.slice(1));
					});
					return prettifiedProjectTypeKey;
				}

			}
		]);

	function getHostAndPort() {
        return location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
    }
})();
