(function() {
	"use strict";
	var loginModule = angular.module("spectrumLoginModule", ["spectrumTransformModule",
																"restangular"]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration + Initialisation
	///////////////////////////////////////////////////////////////////////////////////////////////////
	loginModule
	.config(["RestangularProvider", function(RestangularProvider) {
		RestangularProvider.setBaseUrl(baseUrl + "/rest-with-cookies/api/v1");
	}])
	.run(["$rootScope", "$http", "$q", "$templateCache", "$compile", "$parse", "Restangular", "authStateService",
		function($rootScope, $http, $q, $templateCache, $compile, $parse, Restangular, authStateService) {
			loginModule.restBaseUrl = baseUrl + "/rest-with-cookies/api/v1";

			var deferred = null;
			var loginDialog = null;

			loginModule.setupLogin = function(autoMode) {
				//This function shows the login dialog box.  The autoMode parameter is a boolean that controls whether
				//or not the dialog behaves in 'automatic' mode (which means it popped up in response to an REST call
				//that resulted in a 401).  In automatic mode this method will return a promise that will be resolved
				//when login is successful. In manual mode (which means the login process was initiated as a result of
				//the user clicking 'login') the page will simply be reloaded when login succeeds.

				//Prevent this somehow running twice
				if (deferred != null && loginDialog != null) {
                    loginDialog.modal("show");
                    return deferred.promise;
				} else {
					deferred = $q.defer();
				}

				//We have to manually $compile the template here because we"re too early in the Angular compilation
				//process to just use a <spectrum-login/> tag
				$http.get("partials/login_modal.html", {cache: $templateCache}).success(function(tplContent) {
					var dialogScope = $rootScope.$new(true);
					loginDialog = $compile(tplContent)(dialogScope);

					dialogScope.userName = null;
					dialogScope.password = null;
					dialogScope.loginError = false;
					var modalOptions = {backdrop: !autoMode, keyboard: !autoMode};
					if (!$.fx.off) {
						loginDialog.addClass("fade");
					}

					loginDialog.on("shown.bs.modal", function() {
                        document.getElementById("txt-spec-login-userName").focus();
                        showMask(false);
                    }).modal(modalOptions);


					dialogScope.submit = function() {
					    authStateService.login(dialogScope.userName, dialogScope.password)
						.success(function() {
							if (autoMode) {
								//Resolve the promise we returned so that calling code can retry any operations
								//that were interrupted by the need to login
								loginDialog.modal("hide");
								deferred.resolve(true);
							}
							else {
								//Reload the page because we"re in manualmode. There"s no need to resolve any promises
								window.location.reload(true);
							}
						})
						.error(function() {
							dialogScope.loginError = true;
							//should we be resolving with false here maybe?
						});
					};
				});

				return deferred.promise;
			};

			loginModule.shouldResponseBeIntercepted = function(response) {
				//Only 401 responses that contain the correct error message should be intercepted. We only want to
				//intercept authentication errors from the main spectrum server. Authentication errors that are
				//returned from the main server but actually refer to other external systems are to be ignored here
				//and let to the calling UI application.
				return response.status === 401 &&
						response.data.error === "NOT_AUTHENTICATED" &&
						response.data.systemType === "SPECTRUM" &&
						response.data.systemName === "SPECTRUM";
			};

			loginModule.responseQueue = [];
			Restangular.setErrorInterceptor(function(response, deferred) {
				//Intercepts all HTTP errors - here, we"ll be able to detect authentication errors, interrupt the
				//request chain and authenticate before continuing
				if (loginModule.shouldResponseBeIntercepted(response)) {
					if (!loginModule.inProgress) {
						loginModule.inProgress = true;

						loginModule.setupLogin(true).then(function() {
							$http(response.config).then(function(repeatedResponse) {
								deferred.resolve(repeatedResponse.data);
								authStateService.refreshAuthState();
								for (var i = 0; i < loginModule.responseQueue.length; i++) {
									var queuedResponse = loginModule.responseQueue[i];
									$http(queuedResponse.response.config).then(function(queuedRepeatedResponse) {
										queuedResponse.deferred.resolve(queuedRepeatedResponse.data);
									}, queuedResponse.deferred.reject);
								}
								loginModule.responseQueue = [];
								loginModule.inProgress = false;
							}, deferred.reject);
						});
					}
					else {
						loginModule.responseQueue.push({response: response, deferred: deferred});
					}
					return false;
				}
				return true;
			});
		}
	]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Services
	///////////////////////////////////////////////////////////////////////////////////////////////////
	loginModule
	.factory("authStateService", ["$rootScope", "$http", "Restangular",
		function($rootScope, $http, Restangular) {
			Restangular.setBaseUrl(baseUrl + "/rest-with-cookies/api/v1");
			//authStateService returns an object containing a promise that will contain the auth-state details;
			//	isLoggedIn - bool. False means the user is anon and not authenticated
			//	isAdmin - bool.
			//	currentUserId - int. Only has a useful value if the current user is authenticated
			//	currentUserName - string. As above. Returns 'anonymousUser' for non-authenticated sessions
			var service = {
				refreshAuthState: function() {
					service.authStatePromise = Restangular.one("users/user-auth-state").get();
					service.authStatePromise.then(function() {
						//Once we have the auth-state data, broadcast the event on the $rootScope. Any listeners on
						//this event will pick this up and can respond to it. Allows us to (for example) change the
						//menu content according to the new authentication level
						$rootScope.$broadcast("auth-state-changed");
					});
				},
				login: function(userName, password) {
                    showMask(true, "Logging in");
                    return $http({
                        method: "POST",
                        url: loginModule.restBaseUrl + "/_login",
                        data: $.param({userName: userName, password: password}),
                        headers: {"Content-Type": "application/x-www-form-urlencoded"}
                    })
                    .success(function() {
                        showMask(false);
                    })
                    .error(function() {
                        showMask(false);
                    });
                },
                logout: function() {
                    showMask(true, "Logging out");
                    return $http({method: "POST", url: loginModule.restBaseUrl + "/_logout"})
                    .success(function() {
                        showMask(false);
                    });
                }
			};

			service.refreshAuthState();
			return service;
		}
	]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Directives
	///////////////////////////////////////////////////////////////////////////////////////////////////
	loginModule
	.directive("spectrumLoginButton", ["$http", "$q", "$templateCache", "$compile", "$parse", "authStateService", "$location",
		function($http, $q, $templateCache, $compile, $parse, authStateService, $location) {
			var link = function($scope) {
				authStateService.authStatePromise.then(
					function(authState) {
						$scope.auth = authState;
					}
				)
				.then(
					function() {
						$scope.$watch("auth", function() {
							//Watch this scope"s auth variable, and response to changes with UI updates
							if ($scope.auth === undefined) {
								return;
							}

							var user = $scope.auth.currentUserName;
							var anon = user === "anonymousUser";
							if (user.length > 35) {
								user = user.substr(0, 35) + "...";
							}

							$scope.message = anon ? "Log In" : "Log Out (" + user + ")";
						});

						$scope.clicked = function() {
							//When the button is clicked, either logo ut or set up the login in manual mode
							if ($scope.auth.isLoggedIn) {
								authStateService.logout().success(function() {
								    window.location = baseUrl;
								});
							}
							else {
								loginModule.setupLogin(false);
							}
						};

						$scope.isShown = function() {
                            return $location.path() !== '/login' || $scope.auth.isLoggedIn;
                        };
					}
				);

				$scope.$on("auth-state-changed", function() {
					//When the auth-state-changed event is received from $rootScope, change $scope.auth to
					//invoke the above $watch
					authStateService.authStatePromise.then(function(authState) {
						$scope.auth = authState;
					});
				});
			};

			return {
				restrict: "E",
				templateUrl: "partials/menu_item_login.html",
				replace: true,
				link: link
			};
		}
	]);
})();
