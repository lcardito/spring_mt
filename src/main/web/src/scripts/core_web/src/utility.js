"use strict";

var spectrumUtilitiesModule = angular.module("spectrumUtilitiesModule", [
	"restangular",
	"minicolors",
	"spectrumWidgetLoadingModule"
]);

spectrumUtilitiesModule.factory("saveWidgetConfig", ["Restangular", function (Restangular) {
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


var blankImage = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

function getStandardWidgetData($scope, minicolors, TITLE_BAR_COLORS) {
	return {
        showRefreshOptions: true,
        appUrl: "",
        windowTitle: $scope.widget.title,
        autoRefresh: $scope.widget.hasOwnProperty("autoRefresh") ? $scope.widget.autoRefresh : "0",
        titleBgColor: $scope.widget.hasOwnProperty("bgColor") ? $scope.widget.bgColor : TITLE_BAR_COLORS.bgColor,
        titleTxtColor: $scope.widget.hasOwnProperty("txtColor") ? $scope.widget.txtColor : TITLE_BAR_COLORS.txtColor,
        minicolorsSettings: minicolors
    };
}

function setupDefaultRestangularUrlModifications(RestangularProvider) {
	RestangularProvider.setBaseUrl(baseUrl + "/rest-with-cookies/api/v1").setDefaultHeaders({"Content-Type": "application/json"});
}

function setupWidgetTweaks(angular) {
	angular.module("adf").run(["$templateCache", function ($templateCache) {
		$.get("partials/widgets/widget.html", function(widgetHtml) {
			$templateCache.put("../src/templates/widget.html", widgetHtml);
		});
		$.get("partials/widgets/dashboardEdit.html", function(dashboardEditHtml) {
			$templateCache.put("../src/templates/dashboard-edit.html", dashboardEditHtml);
		});
	}]);
}

function spectrumRestangularErrorHandler($scope) {
	return function (err) {
		$scope.nameError = null;
		$scope.error = null;
		$scope.ready = true;
		showMask(false);
		delete $scope.error;
		if (err.status === 400 || err.status === 500 || err.status === 403) {
			// We just assume that any bad requests are because the name is invalid, which is the only reason
			// for them for now. Obviously this mechanism will need to become more complex at some point.
			if (err.data.message) {
				$scope.error = err.data.message;
				window.scrollTo(0, 0);
			} else {
				$scope.err = err.data;
			}
		}
	};
}
function onWidgetOptionsCollapsed(event) {
	event.data.$scope.$apply(function () {
		delete event.data.$scope.widgetOptionsActive;
	});
}

function showWidgetOptions($scope) {
	$scope.widgetOptionsActive = true;
	$scope.oldData = $.extend({}, $scope.data);
	$("#widget-configuration-" + $scope.widget.wid).collapse("show");
}

function hideWidgetOptions($scope) {
	$("#widget-configuration-" + $scope.widget.wid).collapse("hide");
	$("#widget-modal-" + $scope.widget.id).modal("hide");
    $scope.showConfigModal = false;
}

function setupWidgetOptionFunctions($scope) {
	$("#personalised-dashboard")
		.off("hidden.bs.collapse", "#widget-configuration-" + $scope.widget.wid, onWidgetOptionsCollapsed)
		.on("hidden.bs.collapse", "#widget-configuration-" + $scope.widget.wid, { $scope: $scope }, onWidgetOptionsCollapsed);
	$scope.cancelOptions = function () {
		cancelOptions($scope);
	};
	$scope.showWidgetOptions = function() {
		showWidgetOptions($scope);
	};

	$scope.hideWidgetOptions = function() {
		hideWidgetOptions($scope);
	};
}

function standardSaveOptions($scope, saveWidgetConfig, validForm, callback) {
	if (validForm) {
		$scope.ready = false;
		if ($scope.data.windowTitle !== undefined && $scope.data.windowTitle !== null) {
            $scope.widget.title = $scope.data.windowTitle;
		}
		if ($scope.data.autoRefresh !== undefined && $scope.data.autoRefresh !== null) {
            $scope.widget.autoRefresh = $scope.data.autoRefresh;
			setupIndividualRefreshTimer($scope.widget);
		}
		if ($scope.data.titleBgColor !== undefined && $scope.data.titleBgColor !== null) {
            $scope.widget.bgColor = $scope.data.titleBgColor;
		}
		if ( $scope.data.titleTxtColor !== undefined && $scope.data.titleTxtColor !== null) {
            $scope.widget.txtColor = $scope.data.titleTxtColor;
		}
        if ($scope.update !== undefined) {
            $scope.update(false);
        } else {
            $scope.ready = true;
        }

        $scope.widget.config = $scope.config;
		saveWidgetConfig($scope, callback);

		$scope.hideWidgetOptions($scope);
	} else {
		$scope.ready = true;
	}
	showMask(false);
}

function cancelOptions($scope) {
	$scope.ready = false;
	$scope.data = $scope.oldData;
	$scope.update(false);
	hideWidgetOptions($scope);
}

var individualRefreshTimers = {};
function setupIndividualRefreshTimer(widget) {
    if (!widget || !widget.wid || !widget.autoRefresh) {
		return;
	}
	if (individualRefreshTimers.hasOwnProperty(widget.wid)) {
		clearTimeout(individualRefreshTimers[widget.wid]);
	}
	var autoRefreshTimeWanted = parseInt(widget.autoRefresh, 10);
	if (autoRefreshTimeWanted != 0) {
		individualRefreshTimers[widget.wid] = setTimeout(function () {
			if (!$("#widget-configuration-" + widget.wid).is(":visible")) {
				console.log("Actually refreshing widget: " + widget.wid);
				angular.element('#widget-' + widget.wid).scope().reload()
			}
			setupIndividualRefreshTimer(widget);
		}, autoRefreshTimeWanted * 60000);
	}
}

function toggleWidgetResize(widget){
    var widgetId = widget.wid;
    angular.element(".dashboard").scope().$watch("editMode", function (newVal, oldVal) {
      $('#widget-content-' + widgetId).resizable({
        disabled: !newVal,
        handles: 's',
        stop: function( event, ui ) {
          widget.height = ui.size.height;
        }
      });
    });

    if (isNaN(widget.height)) {
        widget.height = 200;
    }
    $('#widget-content-' + widgetId).height(widget.height + 'px');
}
