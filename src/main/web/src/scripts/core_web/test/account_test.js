'use strict';

describe('Test Account Module', function() {

    beforeEach(module('accountModule'));

    var $scope,
        rootScope,
        controller,
        Restangular,
        authStateService,
        httpBackend;

    var principal = {
        type: "USER",
        id: 1,
        name: "test",
        active: true,
        external: true
    };

    var user = {
        id: 1,
        name: "admin",
        email: "admin@example.com",
        role: "ROLE_ADMIN",
        isExternal: true,
        syncCycle: 1,
        isActive: true,
        isDeleted: false,
        firstName: "first",
        lastName: "last"
    };
    var nexusiqApp = {
        id: 3,
        supportedAppId: 3,
        type: "NEXUSIQ",
        linkConfigured: false
    };

    beforeEach(inject(function ($rootScope, _$httpBackend_, $controller, _Restangular_, _authStateService_) {
        rootScope = $rootScope;
        $scope = $rootScope.$new();
        Restangular = _Restangular_;
        authStateService = _authStateService_;
        httpBackend = _$httpBackend_;

        var userAuthState = testUtils.getUserAuthState();

        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/users/user-auth-state").respond(userAuthState);
        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/principals").respond([principal]);
        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/users/" + userAuthState.currentUserId).respond(user);
        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/users/" + userAuthState.currentUserId + "/keys").respond([]);
        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/users/" + userAuthState.currentUserId + "/groups").respond([]);
        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/installed-application?appType=nexusiq").respond([nexusiqApp]);

        controller = $controller('AccountController', {
            '$scope': $scope,
            Restangular: Restangular,
            authStateService: authStateService
        });
    }));

   it('validate account', function() {
        rootScope.$digest();
        httpBackend.flush();

        expect($scope.user).toBeDefined();
        expect($scope.user.id).toBe(user.id);
        expect($scope.user.name).toBe(user.name);
        expect($scope.user.email).toBe(user.email);
        expect($scope.user.role).toBe(user.role);
        expect($scope.user.isExternal).toBe(user.isExternal);
        expect($scope.user.syncCycle).toBe(user.syncCycle);
        expect($scope.user.isActive).toBe(user.isActive);
        expect($scope.user.isDeleted).toBe(user.isDeleted);
        expect($scope.user.firstName).toBe(user.firstName);
        expect($scope.user.lastName).toBe(user.lastName);
        expect($scope.nexusIQApps[0]).toEqual(jasmine.objectContaining(nexusiqApp));
    });

   it('will save user credentials', function() {
        rootScope.$digest();
        httpBackend.flush();

        httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/application/installed-application/3/saveCredentials", {
            userName: "test",
            password: "test"
        }).respond({});

        $scope.nexusIQApps.chosenApp = $scope.nexusIQApps[0];
        $scope.nexusUserName = "test";
        $scope.nexusUserPassword = "test";

        $scope.saveUserCreds();

        httpBackend.flush();

        expect($scope.successMsg).toBe('User Information updated');
        expect($scope.errors).toEqual([]);
   });

   it('will not save user credentials', function() {
           rootScope.$digest();
           httpBackend.flush();

           httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/application/installed-application/3/saveCredentials", {
               userName: "test",
               password: "test"
           }).respond(500, {});

           $scope.nexusIQApps.chosenApp = $scope.nexusIQApps[0];
           $scope.nexusUserName = "test";
           $scope.nexusUserPassword = "test";
           $scope.successMsg = 'User Information updated';

           $scope.saveUserCreds();

           httpBackend.flush();

           expect($scope.successMsg).toBe(null);
           expect($scope.errors).toContain('There was an error saving your credentials. Please try again or contact an Administrator.');
      });

});


