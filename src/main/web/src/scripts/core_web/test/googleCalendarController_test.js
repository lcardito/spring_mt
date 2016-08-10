describe('Test Google Calendar Controller', function() {

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

    afterEach(function() {
        angularSpy.and.callThrough();
    });

    beforeEach(inject(function ($rootScope, _Restangular_, _$httpBackend_, $controller, getAppsOfType, _dashboard_) {
        rootScope = $rootScope;
        $scope = $rootScope.$new();
        Restangular = _Restangular_;
        httpBackend = _$httpBackend_;
        dashboardProvider = _dashboard_;

        httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/users/user-auth-state').respond(testUtils.getUserAuthState());
        listApplicationMock = jasmine.createSpy('listApplication');
        angularSpy = spyOn(angular, 'element').and.returnValue(testUtils.getPersonalisedDashboardModel([testUtils.getConfluenceWidget()]));


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

            controller = $controller('googleCalendarController', {
                '$scope': $scope,
                'widget': widget,
                'arrayTableModelService': arrayTableModelServiceMock,
                'listApplicationLinks': listApplicationMock,
                'Restangular': Restangular,
            });
        }
    }));

   it('Confluence notification controller is configured in dashboard', function(){
        this.init();
        var calendarWidget = dashboardProvider.widgets['google-calendar'];
        expect(calendarWidget).toBeDefined();
        expect(calendarWidget.reload).toBe(false);
        expect($scope.data.availableTypes.length).toBe(2);
        expect($scope.data.availableTypes[0].name).toBe("Table");
        expect($scope.data.availableTypes[1].name).toBe("Grid");
    });

  });
