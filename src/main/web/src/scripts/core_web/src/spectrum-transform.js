(function() {
	"use strict";
	var spectrumTransformModule = angular.module("spectrumTransformModule", ["restangular"]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration & Initialisation
	///////////////////////////////////////////////////////////////////////////////////////////////////
	spectrumTransformModule
	.config(["$httpProvider", "RestangularProvider", function($httpProvider, RestangularProvider) {
		$httpProvider.interceptors.push("requestTransformInterceptor");

		// Unwraps the object returned from spectrum server, adds the totalLength (total available elements) as a
		// property and returns the element list. This only happens in case a wrapped object is received
		RestangularProvider.addResponseInterceptor(function(result, operation) {
			if(operation === "getList" && result.totalLength != undefined && result.elements != undefined) {
				result.elements.totalLength = result.totalLength;
				return result.elements;
			}
			return result;
		});
	}]);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Services
	///////////////////////////////////////////////////////////////////////////////////////////////////
	spectrumTransformModule
	.factory("requestTransformInterceptor", function() {
		var service = {
			request: handleRequest
		};

		return service;

		function handleRequest(config) {
			//Only when calling get on partials should we prefix with random string
			//the URLs are all relative so only catch where the partial URL starts with partials/
			if (config.method === "GET") {
				if (config.url !== "undefined" && config.url.indexOf("partials/") === 0) {
					config.url = config.url.replace("partials/", baseUrl + "/partials/");
				}
			}
			return config;
		}

	});
})();
