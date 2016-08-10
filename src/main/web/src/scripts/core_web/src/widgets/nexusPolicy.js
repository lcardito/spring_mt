	var blankImage = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
	"use strict";

	var nexusPolicyModule = angular.module("adf.widget.nexusPolicy", ["adf.provider", "spectrumUtilitiesModule"]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration of custom ADF templates
	///////////////////////////////////////////////////////////////////////////////////////////////////
	setupWidgetTweaks(angular);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration & Initialisation
	///////////////////////////////////////////////////////////////////////////////////////////////////
	nexusPolicyModule.config(["RestangularProvider", "dashboardProvider", function(RestangularProvider, dashboardProvider) {
	setupDefaultRestangularUrlModifications(RestangularProvider);
		dashboardProvider.widget("nexus-policy-violations", {
			title: "Nexus Policy Violations",
			class: "",
			colour: "",
			description: "Latest Policy Violations from Nexus",
			templateUrl: "partials/widgets/nexusPolicy.html",
			controller: "nexusPolicyController",
		});
	}]).createErrorHandler = spectrumRestangularErrorHandler;

	nexusPolicyModule.controller("nexusPolicyController", ["$q", "$scope", "widget", "Restangular", "$timeout",
		"getAppsOfType", "arrayTableModelService", "saveWidgetConfig", "MINICOLORS_SETTINGS", "TITLE_BAR_COLORS",
			function ($q, $scope, widget, Restangular, $timeout, getAppsOfType, arrayTableModelService, saveWidgetConfig,
			MINICOLORS_SETTINGS, TITLE_BAR_COLORS) {

			$scope.showConfigModal = false;
			$scope.ready = true;
			$scope.hasResults = false;
			$scope.nexusApps = [];
			$scope.errorStatus = null;
			$scope.widget = widget;
			toggleWidgetResize(widget);

			$scope.data = getStandardWidgetData($scope, MINICOLORS_SETTINGS, TITLE_BAR_COLORS);

			 $("#widget-modal-"+widget.id).on('shown.bs.modal', function() {
				$scope.showConfigModal = true;
			});

			$scope.showWidgetConfigModal = function(){
				$("#widget-modal-"+widget.id).modal("show");
				$scope.nexusPolicy = {};

				Restangular.one("nexus/widget/" + $scope.widget.id + "/config").get().then(function (nexusConfig) {
					$scope.errorStatus = null;
					$scope.nexusPolicy = JSON.parse(JSON.parse(nexusConfig.config).policies)
					angular.forEach($scope.nexusPolicy, function(policy) {
                        policy.selectedStages = _(policy.stages).filter({selected: true}).value();
                    });

					showMask(false);
					$("#widget-modal-"+$scope.widget.id).modal("show");
				}, function(error) {
					$scope.errorStatus = error.status;
					showMask(false);
				});

			};

			$scope.saveNexusConfig = function(nexusPolicy){
				$("#widget-modal-"+widget.id).modal("hide");
				$scope.ready = false;
				var policiesToSave = [];
				angular.forEach(nexusPolicy, function(policy){
					if(policy.selected) {
						var policyToSave = {};
						policyToSave.id = policy.id;
						policyToSave.selected = true;
						policyToSave.stages =  _(policy.selectedStages).value().map(function (x) {return { name: x.name, selected: true }});
					    policiesToSave.push(policyToSave);
                    };
				});
				$scope.config.policies = policiesToSave;
				standardSaveOptions($scope, saveWidgetConfig, true);
				showMask(false);
			};

			 $scope.hideWidgetOptions = function(){
				$("#widget-modal-" + widget.id).modal("hide");
				$scope.update();
              }

			$scope.update = function() {
				$scope.ready = false;
				$scope.errorStatus = null;
				$scope.hasResults = false;
				Restangular.all("nexus/widget/" + $scope.widget.id + "/policy").getList().then(function (nexusPolicies) {
					$scope.ready = true;
					$scope.errorStatus = null;
                    $scope.hasResults = _.filter(nexusPolicies, function(o) { return o.stages.length > 0; }).length > 0

					angular.forEach(nexusPolicies, function(policy){
						policy.label = getPolicyLabel(policy);
					});

					$scope.nexusPolicyData = nexusPolicies;

					$timeout(function() {
	                    $('.nexus-policy-hover-' + widget.id).each(function () {
	                        var $elem = $(this);
	                        var myPolicy = _($scope.nexusPolicyData).filter({ id: $elem.data("policyid") }).value()[0];
	                        var myStage = _(myPolicy.stages).filter({ name: $elem.data("stagename") }).value()[0];

	                        var htmlContent = "";
	                        if (myStage.violations.length == 0) {
	                            htmlContent += '<h4>No Violations</h4>';
	                        } else {
		                        for (var i=0; i < myStage.violations.length; i++) {
		                            var application = myStage.violations[i];
		                            htmlContent += '<h2 style="margin-top: 5px"><a href="' +  application.reportUrl  + '" target="_blank">';
		                            htmlContent +=  application.applicationName  + ' - <span class="applicationThreatLevel">' + application.components.length + '</span></a></h2>';
		                            for (var j=0; j < application.components.length; j++) {
		                                var component = application.components[j];
		                                htmlContent += '<li><span class="glyphicon glyphicon-asterisk"></span>' + component.groupId  + ' : ' + component.artifactId + ' : ' + component.version;
		                            }
		                            htmlContent += "</ul>";

		                        }
	                        }

	                        $elem.popover({
	                            trigger: 'manual',
	                            animation: false,
	                            title: $elem.text(),
	                            content : htmlContent,
	                            //placement: "bottom",
	                            html: true,
	                        }).on("mouseenter", function () {
                                $('.nexus-policy-hover-' + widget.id).not(this).popover('hide');
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
                                }, 300);
                            });
	                    });
	                });
				}, function(error) {
                    $scope.errorStatus = error.status;
                    $scope.ready = true;
                    showMask(false);
                });

			};

		$scope.update();

		function getPolicyLabel(policy){
			var highestThreatLevel = policy.highestThreatLevel;
			var label = "moderate";
			if(highestThreatLevel >=4  && highestThreatLevel <= 6){
				var label = "severe";
			}
			else if(highestThreatLevel >=7  && highestThreatLevel <= 10){
				var label = "critical";
			}
			return label;
		}

	}

	]);
