'use strict';
var baseUrl = "http://www.example.com";
describe('login page', function() {

	beforeEach(module('mainLoginModule'));

    var $rootScope,
        $scope,
        httpBackend,
        controller,
        $window,
        authStateService,
        authRequestHandler;

    var appType = "jira",
        appId = 1,
        itemKey = "ISSUE-1";

    beforeEach(inject(function(_$rootScope_, $controller, _$httpBackend_, _authStateService_){
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        httpBackend = _$httpBackend_;
        authStateService = _authStateService_;

        var userAuthState = testUtils.getUserAuthState();

        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/users/user-auth-state").respond(userAuthState);
        authRequestHandler = httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/_login");
        authRequestHandler.respond('');

        $window = {};
        $window.location = {
            href: 'http://www.example.com'
        };
        spyOn(authStateService, 'login').and.callThrough();

        controller = $controller('DashboardController', {
            '$scope': $scope,
            'authStateService': authStateService,
            '$window': $window
        });
    }));

	it('Tests login', function() {
	    $scope.userName = 'user';
	    $scope.password = 'password';
        $scope.submit();
        expect(authStateService.login).toHaveBeenCalledWith('user', 'password');
    });

    it('Tests login fails', function() {
        authRequestHandler.respond(401, '');
        $scope.userName = 'user';
        $scope.password = 'password';
        $scope.submit();
        httpBackend.flush();
        expect(authStateService.login).toHaveBeenCalledWith('user', 'password');
        expect($window.location.href).toBe('http://www.example.com');
        expect($scope.loginError).toBe(true);
    });

    it('Tests redirect after login', function() {
        expect($window.location.href).toBe('http://www.example.com');
        $scope.submit();
        httpBackend.flush();
        expect($window.location.href).toBe('http://www.example.com/personalised-dashboard.html');
    });

});
