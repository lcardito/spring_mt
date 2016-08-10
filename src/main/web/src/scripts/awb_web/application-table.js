(function() {
	"use strict";
	var applicationTableModule = angular.module("applicationTableModule", ["spectrumLoginModule",
																			"spectrumTableModule",
																			"spectrumArrayTableModelModule",
																			"spectrumUtilitiesModule",
																			"restangular"
																			]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration & Initialisation
	///////////////////////////////////////////////////////////////////////////////////////////////////
	applicationTableModule
	.config(["RestangularProvider", function(RestangularProvider) {
		setupDefaultRestangularUrlModifications(RestangularProvider);
	}])
	.createErrorHandler = spectrumRestangularErrorHandler;

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Directives
	///////////////////////////////////////////////////////////////////////////////////////////////////
	applicationTableModule
	.directive("applicationTable", ["Restangular", "authStateService", "arrayTableModelService",
		function(Restangular, authStateService, arrayTableModelService) {
			showMask(true, "Loading application details");
			var link = function($scope) {
				var STATUSES_TO_ICONS = {
					RUNNING: "ok",
					STOPPED: "remove",
					NOT_CONFIGURED: "ban-circle",
					INVALID_SERVER: "exclamation-sign"
				};

				var updateAppList = function() {
					var supportedApplications = {};
					var isAdmin = false;
					var readOnly = $scope.readOnly === "true";

					//check the authState and set up addActions if the user is an admin
					authStateService.authStatePromise.then(
						function(authState) {
							if ((isAdmin = authState.isAdmin) && !readOnly) {
								$scope.addActions = {
									name: "Add application",
									icon: "plus",
									run: "applications.html#/applications/create"
								};
							}

							return Restangular.all("application/supported-application").getList();
						}, applicationTableModule.createErrorHandler($scope)
					)
					.then(
						function(supportedApps) {
							//get the list of supported applications and set up a map of {id -> name}
							angular.forEach(supportedApps, function(supportedApp) {
								supportedApplications[supportedApp.id] = supportedApp.name;
							});

							return Restangular.all("application/installed-application").getList();
						}, applicationTableModule.createErrorHandler($scope)
					)
					.then(
						function(installedApps) {
							$scope.appRowModel = arrayTableModelService.createArrayTableModel(installedApps,
								function(app) {
                                    var actionObjects = [];
                                    if (isAdmin) {
                                        actionObjects.push(
                                            {
                                                name: "Edit",
                                                icon: "pencil",
                                                class: "default",
                                                run: "applications.html#/applications/" + app.id
                                            }
                                        );
                                        if (app.linkConfigurable) {
                                            if (app.linkConfigured) {
                                                actionObjects.push({
                                                    name: "Re-configure link",
                                                    icon: "link",
                                                    class: "default",
                                                    run: "applications.html#/applications/" + app.id + "/link"
                                                });
                                            } else {
                                                actionObjects.push({
                                                    name: "Link",
                                                    icon: "link",
                                                    class: "default",
                                                    run: "applications.html#/applications/" + app.id + "/link"
                                                });
                                            }
                                        }
                                        actionObjects.push({
                                            name: "Delete",
                                            icon: "trash",
                                            class: "danger",
                                            run: function (data) {
                                                deleteApp(data.id);
                                            }
                                        });

                                        if(app.linkConfigured) {
	                                        switch (app.supportedAppName) {
	                                            case "JIRA":
	                                            case "Confluence":
	                                            case "Bitbucket Server":
	                                                actionObjects.push({
	                                                    name: "Install Spectrum Plugins",
	                                                    icon: "circle-arrow-up",
	                                                    class: "default",
	                                                    run: function (data) {
	                                                        installPlugins($scope, data);
	                                                    }
	                                                });
	                                                break;
	                                        }
	                                        getPluginStatus($scope, app);
                                        }

                                    }

									//set this application's type
									app.type = supportedApplications[app.supportedAppId];
									// all nexus apps have the same icon;
									if(app.type == "Nexus-IQ"){
										app.type = "nexus";
									}

									if (app.type !== undefined) {
										app.pictureType = app.type.toLowerCase();
									} else {
										app.pictureType = "";
									}
									app.oauthLinkConfigured = app.linkConfigured ? "Yes" : "No";

									//Get and set this application's status
                                    app.statusIcon = STATUSES_TO_ICONS[app.status];

									//Finally, return the mapping required by spectrum-table (represent this app's row)
									return {data: app, actions: actionObjects, url: app.url, defaultAction: [], external: true};
							}, true, ['name']);
						}, applicationTableModule.createErrorHandler($scope)
					);
				};

				var getPluginStatus = function ($scope, app){
				    Restangular.one("application/installed-application/"+app.id+"/plugin-status").get().then(function(pluginStatus) {
				    if($scope.appRowModel != undefined){
                        var currentScopeApp = _.find($scope.appRowModel.rows, function(o) {
                            return o.data.id == app.id
                        });
                        _.find(currentScopeApp.actions, function(o) {
                            if(o.name == 'Install Spectrum Plugins'){
                                if(pluginStatus.pluginStatus == "ENABLED"){
                                    o.name = 'Re-Install Spectrum Plugins';
                                }
                            }
                        });
                    }
                    });
				 }

                var deleteApp = function (appId) {
                    delete $scope.error;
                    bootbox.confirm("Are you sure you want to delete this application?",
                        function (result) {
                            if (result) {
                                showMask(true, "Deleting application");
                                Restangular.one("application/installed-application", appId).remove().then(
                                    function () {
                                        updateAppList();
                                        showMask(false);
                                    }, applicationTableModule.createErrorHandler($scope)
                                );
                            }
                        }
                    );
                };

                var installPlugins = function ($scope, app) {
                    bootbox.confirm("Do you want to install all Spectrum plugins in \"" + app.name + "\"?",
                        function (result) {
                            if (result) {
                                showMask(true, "Installing Spectrum plugins in " + app.name);
                                Restangular.one("application/installed-application/" + app.id + "/install-plugins").customPOST().then(
                                    function () {
                                        showMask(false);
                                        bootbox.dialog({
                                          message: "Spectrum plugins have been successfully installed",
                                          buttons: {
                                            success: {
                                              label: "OK",
                                              className: "btn-primary",
                                              callback: function() {
                                                getPluginStatus($scope, app);
                                              }
                                            }}});
                                    },
                                    function(error) {
                                        showMask(false);
                                        var message = "Error occurred when installing Spectrum plugins";

                                        if (error && error.data && error.data.message) {
                                            message = error.data.message;
                                        }

                                        bootbox.alert(message);
                                    }
                                );
                            }
                        }
                    );
                };

				updateAppList();
			};

			return {
				restrict: "E",
				templateUrl: "partials/application-table.html",
				scope: {
					//Really this needs to be nested under "data", however angular doesnt play nicely :/
					gridMode: "@",
					gridModeSelectable: "@",
					readOnly: "@"
				},
				link: link
			};
		}
	]);
})();
