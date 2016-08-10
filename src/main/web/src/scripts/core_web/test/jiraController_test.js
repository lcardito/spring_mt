'use strict';

describe('Test JIRA Controller', function() {
	var existingIssueKey = "WID-3";
	var getTimersResponse = {"id":1,"appId":1,"success":true,"remoteId":existingIssueKey,"elapsedTime":null,"startTime":1460126089623};

    beforeEach(module('personalisedDashboardModule'));

    var $scope,
        rootScope,
        controller,
        Restangular,
        httpBackend,
        angularSpy,
        jiraRestTableModelServiceMock,
        dashboardProvider;

    afterEach(function() {
        angularSpy.and.callThrough();
    });

    beforeEach(inject(function ($rootScope, _Restangular_, _$httpBackend_, $controller, getAppsOfType, _dashboard_) {
        rootScope = $rootScope;
        $scope = $rootScope.$new();
        Restangular = _Restangular_;
        httpBackend = _$httpBackend_;
        dashboardProvider = _dashboard_;

        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/supported-application").respond(testUtils.getSupportedApps());
        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/installed-application").respond(testUtils.getAvailableApps());
        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/users/user-auth-state").respond(testUtils.getUserAuthState());

        jiraRestTableModelServiceMock = jasmine.createSpyObj('jiraRestTableModelService', ['createRestTableModel']);
        angularSpy = spyOn(angular, 'element').and.returnValue(testUtils.getPersonalisedDashboardModel([testUtils.getConfluenceWidget()]));


        this.init = function(moreConfig){
            var widget = testUtils.getJIRAWidget();
            for(var prop in moreConfig){
                widget.config[prop] = moreConfig[prop];
            }
            $scope.config = widget.config;

            controller = $controller('jiraController', {
                '$scope': $scope,
                'widget': widget,
                'jiraRestTableModelService': jiraRestTableModelServiceMock,
                Restangular: Restangular
            });
        }
    }));

    it('JIRA Filter result is configured in dashboard', function(){
        this.init();
        var jiraFilterWidget = dashboardProvider.widgets.jira;
        expect(jiraFilterWidget).toBeDefined();
        expect(jiraFilterWidget.reload).toBe(false);
        expect(jiraFilterWidget.title).toBe('Filter Results');
        expect(jiraFilterWidget.description).toBe('Results of a favourite filter from JIRA');
        expect(jiraFilterWidget.templateUrl).toBe('partials/widgets/jira.html');
        expect(jiraFilterWidget.controller).toBe('jiraController');

        expect($scope.data.showRefreshOptions).toBe(true);
        expect($scope.data.appUrl).toBe('');
        expect($scope.data.windowTitle).toBe('My Test JIRA widget');
        expect($scope.data.autoRefresh).toBe('0');
        expect($scope.data.titleBgColor).toBe('#374049');
        expect($scope.data.titleTxtColor).toBe('#FFFFFF');
        expect($scope.data.minicolorsSettings).toEqual({ theme: 'bootstrap', position: 'bottom right', letterCase: 'uppercase' });
    });

    it('There are no table rows when no filter returned', function() {
        this.init();
        httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/message").respond(function (method, url, data, headers) {
            return {};
        });

        rootScope.$digest();
        httpBackend.flush();

        expect($scope.appType).toBe('JIRA');
        expect($scope.ready).toBe(true);
        expect($scope.resultTable.rows).toEqual([]);
    });

    it('There are no table rows when the filter is not choosen', function() {
        this.init();
        var payloadJson = {
            "self": "http://jira/rest/api/2/filter/10302",
            "id": "10302",
            "name": "Themes X",
            "favourite": true,
        };
        httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/message", function(data) {
            var requestData = JSON.parse(data);
            return requestData.method == 'getFilters';
        }).respond(200, {
            payload: JSON.stringify(payloadJson)
        });

        rootScope.$digest();
        httpBackend.flush();

        expect($scope.appType).toBe('JIRA');
        expect($scope.resultTable.rows).toEqual([]);
    });

    it('Calling scope.update will create table when chosenFilter is set', function() {
        this.init();
        var payloadJson = [{
            "self": "http://jira/rest/api/2/filter/10302",
            "id": "10302",
            "name": "Themes X",
            "favourite": true
        }];
        httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/message", function(data) {
            var requestData = JSON.parse(data);
            return requestData.method == 'getFilters';
        }).respond(200, {
            payload: JSON.stringify(payloadJson)
        });

        expect($scope.appType).toBe('JIRA');
        expect($scope.resultTable.rows).toBeUndefined();
        expect($scope.data.chosenFilter).toBeUndefined();

        jiraRestTableModelServiceMock.createRestTableModel.and.returnValue([{id: "1"}]);
        $scope.data.chosenFilter = {
            id: '10302'
        };

        $scope.$digest();
        $scope.update();
        httpBackend.flush();

        expect($scope.resultTable).toEqual([{id: "1"}]);
        expect(jiraRestTableModelServiceMock.createRestTableModel).toHaveBeenCalledWith({
            type: 'jira',
            id: 1,
            url: undefined
        }, $scope.widget, false, [{
            name: "Comments",
            icon: "comment",
            class: "default",
            run: jasmine.any(Function)
        }, {
            name: 'Record time',
            icon: 'adjust',
            class: 'default',
            run: jasmine.any(Function)
           }
        ]);
    });

    it('Calling getFilterList will update scope', function(){
        this.init({filterId: '10302'});
        var chosenFilter = {
            "self": "http://jira/rest/api/2/filter/10302",
            "id": "10302",
            "name": "Themes X",
            "favourite": true,
        };
        var payloadJson = [chosenFilter];
        httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/message", function(data) {
            var requestData = JSON.parse(data);
            return requestData.method == 'getFilters';
        }).respond(200, {
            payload: JSON.stringify(payloadJson)
        });

        jiraRestTableModelServiceMock.createRestTableModel = jasmine.createSpy().and.returnValue([{id: 'Hello'}]);

        $scope.getFilterList();
        $scope.$digest();
        httpBackend.flush();

        expect($scope.data.chosenFilter).toEqual(chosenFilter);
        expect($scope.resultTable).toEqual([{id: "Hello"}]);
        expect(jiraRestTableModelServiceMock.createRestTableModel).toHaveBeenCalledWith(
        {
            type: 'jira',
            id: 1,
            url: undefined
        }, $scope.widget, false, [{
            name: "Comments",
            icon: "comment",
            class: "default",
            run: jasmine.any(Function)
        }, {
            name: 'Record time',
            icon: 'adjust',
            class: 'default',
            run: jasmine.any(Function)
        }]);
    });

    it('Save widget configuration', inject(function($timeout) {
        this.init({filterId: '10302'});
        var chosenFilter = {
            "self": "http://jira/rest/api/2/filter/10302",
            "id": "10302",
            "name": "Themes X",
            "favourite": true,
        };
        var payloadJson = [chosenFilter];
        httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/message", function(data) {
            var requestData = JSON.parse(data);
            return requestData.method == 'getFilters';
        }).respond(200, {
            payload: JSON.stringify(payloadJson)
        });

        $scope.$digest();
        $timeout.flush();
        httpBackend.flush();

        $scope.saveOptions({$valid: true});

        httpBackend.expectPUT(baseUrl + "/rest-with-cookies/api/v1/dashboard/3/widget/1", function(data) {
            var toBeSent = JSON.parse(data);
            expect(toBeSent.config.filterId).toBe("10302");
            expect(toBeSent.config.chosenApp).toBe(1);
            expect(toBeSent.config.chosenFilter).toBe("10302");
            expect(toBeSent.title).toBe("My Test JIRA widget");
            expect(toBeSent.bgColor).toBe("#374049");
            expect(toBeSent.txtColor).toBe("#FFFFFF");
            expect(toBeSent.autoRefresh).toBe("0");

            return data;
        }).respond(200, {});

        $scope.$digest();
        httpBackend.flush();
    }));
});
