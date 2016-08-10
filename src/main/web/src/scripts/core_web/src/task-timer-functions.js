(function() {
	"use strict";
	var spectrumTaskTimerModule = angular.module("spectrumTaskTimerModule", ["restangular"]);

	spectrumTaskTimerModule.config(["RestangularProvider", function(RestangularProvider) {
		RestangularProvider.setBaseUrl(baseUrl + "/rest-with-cookies/api/v1");
	}]);

	spectrumTaskTimerModule.factory("taskTimer", ["$q", "$rootScope", "Restangular", function ($q, $rootScope, Restangular) {
        function errorMessage(app, taskTimer) {
            var timeSpentInMinutes = Math.ceil(taskTimer.elapsedTime / 60);

            return "Something went wrong whilst logging time against issue " +
                "<strong><a target='_blank' href='" + app.url + "/browse/" + taskTimer.remoteId + "'>" + taskTimer.remoteId + "</a></strong>. " +
                "Check that the remote server is available and that you have the correct permissions to log time against " +
                "this task. Please go to the remote server and manually update it if you wish to record this work log." +
                "<br><br>Issue: <strong><a target='_blank' href='" + app.url + "/browse/" + taskTimer.remoteId + "'>" + taskTimer.remoteId + "</a></strong>" +
                "<br>Time spent: " + timeSpentInMinutes + " minute" + (timeSpentInMinutes == 1 ? "" : "s");
        }

		return {
            start: function (app, remoteId) {
                Restangular.one("task-timer/start").customPOST({
                    appId: app.id,
                    remoteId: remoteId
                }).then(function(response) {
                    $rootScope.$broadcast("taskTimersUpdated");
                    return response.successCompletedTaskTimer ? response : $q.reject(errorMessage(app, response.completedTaskTimer));
                }, function(response) {
                    //Not sure how to handle errors, how do we identify issue with previous task vs new one?
                    return $q.reject("There was an issue performing this action. Please refresh the page and try again.");
                }).catch(function(response) {
                    bootbox.alert(response);
                });
            },
            stop: function(app, taskTimerId) {
                bootbox.confirm("This log your time against the remote system, do you wish to proceed?", function(proceed) {
                    if (proceed) {
                        Restangular.one("task-timer/" + taskTimerId + "/stop").customPOST().then(function(response) {
                            $rootScope.$broadcast("taskTimersUpdated");
                            return response.successCompletedTaskTimer ? response : $q.reject(errorMessage(app, response.completedTaskTimer));
                        }, function() {
                            return $q.reject("There was an issue performing this action. Please refresh the page and try again.");
                        }).catch(function(response) {
                            bootbox.alert(response);
                        });
                    }
                });
            }
        };
	}]);
})();
