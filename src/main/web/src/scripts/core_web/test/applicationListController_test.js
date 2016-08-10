'use strict';

describe('Test Application List Controller', function() {

    beforeEach(module('personalisedDashboardModule'));

    var $scope,
        rootScope,
        controller,
        Restangular,
        httpBackend,
        angularSpy,
        arrayTableModelService,
        dashboardProvider;

    afterEach(function() {
        angularSpy.and.callThrough();
    });

    beforeEach(inject(function ($rootScope, _Restangular_, _$httpBackend_, $controller, getAppsOfType, _dashboard_, _arrayTableModelService_) {
        rootScope = $rootScope;
        $scope = $rootScope.$new();
        Restangular = _Restangular_;
        httpBackend = _$httpBackend_;
        dashboardProvider = _dashboard_;
        arrayTableModelService = _arrayTableModelService_;

        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/users/user-auth-state").respond(testUtils.getUserAuthState());
        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/installed-application").respond(testUtils.getAvailableApps());
        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/supported-application").respond(testUtils.getSupportedApps());

        angularSpy = spyOn(angular, 'element').and.returnValue(testUtils.getPersonalisedDashboardModel([testUtils.getConfluenceWidget()]));

        httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "application-list",
            method: "getData",
            appId: null
        }).respond({
            payload: JSON.stringify(testUtils.getAvailableApps())
        });

        $scope.$parent.$parent = { editMode: false };

        this.init = function(moreConfig){
            var widget = testUtils.getApplicationListWidget();
            for (var prop in moreConfig){
                widget.config[prop] = moreConfig[prop];
            }
            $scope.config = widget.config;

            controller = $controller('applicationListController', {
                '$scope': $scope,
                'widget': widget,
                'arrayTableModelService': arrayTableModelService,
                Restangular: Restangular
            });
        }
    }));

    it('Update widget when grid layout is not set', inject(function($timeout) {
        httpBackend.whenPUT(baseUrl + "/rest-with-cookies/api/v1/dashboard/5/widget/1", function(data) {
            expect($scope.widget.config.gridLayout).toBe(true);

            return data;
        }).respond({

        });

        this.init();

        expect($scope.widget.config.gridLayout).toBeUndefined();

        $scope.$digest();
        httpBackend.flush();
        $timeout.flush();
    }));

    it('Update widget when grid layout is changed', inject(function($timeout) {
        httpBackend.whenPUT(baseUrl + "/rest-with-cookies/api/v1/dashboard/5/widget/1", function(data) {
            expect($scope.widget.config.gridLayout).toBe(false);

            return data;
        }).respond({

        });

        this.init({ gridLayout: true });

        expect($scope.widget.config.gridLayout).toBe(true);

        $scope.$digest();
        httpBackend.flush();
        $timeout.flush();

        $scope.data.gridMode = false;

        $scope.$digest();
    }));

    it('Do not update widget when grid layout is not changed', inject(function($timeout) {
        this.init({ gridLayout: true });

        expect($scope.widget.config.gridLayout).toBe(true);

        $scope.$digest();
        httpBackend.flush();
        $timeout.flush();

        $scope.data.gridMode = true;

        $scope.$digest();
    }));

    it('Check result table to contain applications with correct icons', inject(function($timeout) {
        this.init({ gridLayout: true });

        $scope.$digest();
        httpBackend.flush();
        $timeout.flush();

        //Note the ordering will be the order passed in, as angular does the correct ordering as part of the template
        expect($scope.resultTable.rows.length).toBe(4);

        var row = $scope.resultTable.rows[0];
        expect(row.data.id).toBe(1);
        expect(row.data.supportedAppId).toBe(1);
        expect(row.data.type).toBe("JIRA");
        expect(row.data.linkConfigured).toBe(true);
        expect(row.data.pictureType).toBe("jira");
        expect(row.data.status).toBe("RUNNING");
        expect(row.data.statusIcon).toBe("ok");

        row = $scope.resultTable.rows[1];
        expect(row.data.id).toBe(2);
        expect(row.data.supportedAppId).toBe(2);
        expect(row.data.type).toBe("Confluence");
        expect(row.data.linkConfigured).toBe(true);
        expect(row.data.url).toBe("http://confluence.clearvision.com");
        expect(row.data.pictureType).toBe("confluence");
        expect(row.data.status).toBe("STOPPED");
        expect(row.data.statusIcon).toBe("remove");

        row = $scope.resultTable.rows[2];
        expect(row.data.id).toBe(3);
        expect(row.data.supportedAppId).toBe(3);
        expect(row.data.type).toBe("Bitbucket Server");
        expect(row.data.linkConfigured).toBe(false);
        expect(row.data.url).toBeUndefined();
        expect(row.data.pictureType).toBe("bitbucket server");
        expect(row.data.status).toBe("NOT_CONFIGURED");
        expect(row.data.statusIcon).toBe("ban-circle");

        row = $scope.resultTable.rows[3];
        expect(row.data.id).toBe(4);
        expect(row.data.supportedAppId).toBe(4);
        expect(row.data.type).toBe("Jenkins");
        expect(row.data.linkConfigured).toBe(true);
        expect(row.data.url).toBeUndefined();
        expect(row.data.pictureType).toBe("jenkins");
        expect(row.data.status).toBe("INVALID_SERVER");
        expect(row.data.statusIcon).toBe("exclamation-sign");
    }));
});
