'use strict';

describe('Test User Directory Info', function() {

    beforeEach(module('userDirectoryModule'));

    var $scope,
        rootScope,
        controller,
        Restangular,
        httpBackend;

    var userDirectory = {
        id: 1,
        name: "Testing user directory",
        url: "http://www.example.com/crowd",
        syncIntervalInMins: 1,
        active: true,
        ssoEnabled: true,
        ssoDomain: "example.com"
    };

    beforeEach(inject(function ($rootScope, _$httpBackend_, $controller, _Restangular_) {
        rootScope = $rootScope;
        $scope = $rootScope.$new();
        Restangular = _Restangular_;

        httpBackend = _$httpBackend_;
        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/users/user-auth-state").respond(testUtils.getUserAuthState());
        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/userdirectory").respond(userDirectory);

        controller = $controller('ListController', {
            '$scope': $scope,
            Restangular: Restangular
        });
    }));

    it('validate retrieving of user directory', function() {
        rootScope.$digest();
        httpBackend.flush();
        expect($scope.userDirectory).toBeDefined();
        expect($scope.userDirectory.id).toBe(userDirectory.id);
        expect($scope.userDirectory.name).toBe(userDirectory.name);
        expect($scope.userDirectory.url).toBe(userDirectory.url);
        expect($scope.userDirectory.syncIntervalInMins).toBe(userDirectory.syncIntervalInMins);
        expect($scope.userDirectory.active).toBe(userDirectory.active);
        expect($scope.userDirectory.ssoEnabled).toBe(userDirectory.ssoEnabled);
        expect($scope.userDirectory.ssoDomain).toBe(userDirectory.ssoDomain);
    });
});