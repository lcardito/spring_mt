'use strict';

describe('Spectrum Transform', function() {
	var requestTransformInterceptor,
		httpProvider;

	var spectrumItem,
		spectrumItems;

	beforeEach(module('restangular'));
	beforeEach(module('spectrumTransformModule', function($httpProvider) {
		httpProvider = $httpProvider;
	}));

	beforeEach(inject(function (_requestTransformInterceptor_) {
		requestTransformInterceptor = _requestTransformInterceptor_;
	}));

	describe('requestTransformInterceptor', function() {
		it('should be defined', function() {
			expect(requestTransformInterceptor).toBeDefined();
		});

		it('should have a handler for request', function () {
		  expect(angular.isFunction(requestTransformInterceptor.request)).toBe(true);
		});

 		it('should not change the url', function() {
			var config = {method: 'GET', url: 'http://spectrum.com/item'};

			requestTransformInterceptor.request(config);
			expect(config.url).toEqual('http://spectrum.com/item');
		});

 		it('should change the url', function() {
			var config = {method: 'GET', url: 'partials/item'};

			requestTransformInterceptor.request(config);
			expect(config.url).toEqual(baseUrl + '/partials/item');
		});
	});
});
