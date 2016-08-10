
var baseUrl = 'http://www.example.com';

describe('Test Confluence Notification Controller', function() {

    beforeEach(module('personalisedDashboardModule'));

    var $scope,
        rootScope,
        controller,
        Restangular,
        httpBackend,
        angularSpy,
        arrayTableModelServiceMock,
        listApplicationMock,
        dashboardProvider;

    var getTaskAPIUrl = baseUrl + '/rest-with-cookies/api/v1/task/confluence/2';

    beforeEach(inject(function ($rootScope, _Restangular_, _$httpBackend_, $controller, getAppsOfType, _dashboard_) {
        rootScope = $rootScope;
        $scope = $rootScope.$new();
        Restangular = _Restangular_;
        httpBackend = _$httpBackend_;
        dashboardProvider = _dashboard_;

        httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/application/supported-application').respond(testUtils.getSupportedApps());
        httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/application/installed-application').respond(testUtils.getAvailableApps());
        httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/users/user-auth-state').respond(testUtils.getUserAuthState());

        angularSpy = spyOn(angular, 'element').and.returnValue(testUtils.getPersonalisedDashboardModel([testUtils.getConfluenceWidget()]));
        listApplicationMock = jasmine.createSpy('listApplication');

        spyOn($scope, '$on').and.callFake(function(name, callback){
            expect(name).toBe('listApplicationLinksChanged')
        });

        arrayTableModelServiceMock = {
            createArrayTableModel: function(){}
        };

        $scope.$parent.$parent = { editMode: false };

        this.init = function(moreConfig){
            var widget = testUtils.getConfluenceWidget();
            for(var prop in moreConfig){
                widget.config[prop] = moreConfig[prop];
            }
            $scope.config = widget.config;

            controller = $controller('confluenceNotificationController', {
                '$scope': $scope,
                'widget': widget,
                'arrayTableModelService': arrayTableModelServiceMock,
                'listApplicationLinks': listApplicationMock,
                'Restangular': Restangular,
            });
        }
    }));

    afterEach(function() {
        angularSpy.and.callThrough();
    });

    it('Confluence notification controller is configured in dashboard', function(){
        this.init();
        var confluenceTaskWidget = dashboardProvider.widgets['confluence-notifications'];
        expect(confluenceTaskWidget).toBeDefined();
        expect(confluenceTaskWidget.reload).toBe(false);
        expect(confluenceTaskWidget.title).toBe('Notifications');
        expect(confluenceTaskWidget.description).toBe('Up to date list of all your notifications directly from Confluence');
        expect(confluenceTaskWidget.templateUrl).toBe('partials/widgets/confluence.html');
        expect(confluenceTaskWidget.controller).toBe('confluenceNotificationController');

        expect($scope.data.showRefreshOptions).toBe(true);
        expect($scope.data.appUrl).toBe('');
        expect($scope.data.method).toBe('notifications');
        expect($scope.data.windowTitle).toBe('My Test Confluence widget');
        expect($scope.data.autoRefresh).toBe('0');
        expect($scope.data.titleBgColor).toBe('#374049');
        expect($scope.data.titleTxtColor).toBe('#FFFFFF');
        expect($scope.data.minicolorsSettings).toEqual({ theme: 'bootstrap', position: 'bottom right', letterCase: 'uppercase' });
    });

    it('Confluence notification controller will get notifications', function(){
        this.init();

        httpBackend.expectPOST(baseUrl + '/rest-with-cookies/api/v1/message', {"type":"confluence","method":"notifications","appId":2})
            .respond(200, confluenceNotifications);

        spyOn(arrayTableModelServiceMock, 'createArrayTableModel').and.callFake(function(rows, callback, boolean, headers){
            expect(headers).toEqual(['time', 'page', 'prettyDetails']);
            expect(rows.length).toBe(1);

            var resultRow = callback(rows[0]);
            expect(resultRow.data).toEqual(rows[0]);
            expect(resultRow.data.prettyDetails).toEqual('admin commented on a page.');
            expect(resultRow.data.page).toEqual('Meeting Notes');
            expect(resultRow.data.time).toEqual(jQuery.timeago(1462871202000));
            expect(resultRow.external).toBe(true);
            expect(resultRow.url).toEqual('http://confluence.clearvision.com/display/PX/Meeting+Notes');
            expect(boolean).toBe(true);
        });

        $scope.$digest();
        httpBackend.flush();

        expect(arrayTableModelServiceMock.createArrayTableModel).toHaveBeenCalled();
        expect(arrayTableModelServiceMock.createArrayTableModel.calls.count()).toBe(1);
    });

});
