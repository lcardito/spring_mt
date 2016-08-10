
var baseUrl = "http://www.example.com";

describe('Test Nexus Report Controller', function() {

    beforeEach(module('personalisedDashboardModule'));

    var $scope,
        rootScope,
        controller,
        Restangular,
        angularSpy,
        httpBackend,
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

        httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/application/supported-application').respond(testUtils.getSupportedApps());
        httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/application/installed-application').respond(testUtils.getAvailableApps());
        httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/users/user-auth-state').respond(testUtils.getUserAuthState());
        angularSpy = spyOn(angular, 'element').and.returnValue(testUtils.getPersonalisedDashboardModel([testUtils.getConfluenceWidget()]));


        $scope.$parent.$parent = { editMode: false };

        this.init = function(moreConfig){
            var widget = testUtils.getNexusWidget();
            for(var prop in moreConfig){
                widget.config[prop] = moreConfig[prop];
            }
            $scope.config = widget.config;

            controller = $controller('nexusReportController', {
                '$scope': $scope,
                'widget': widget,
                Restangular: Restangular
            });
        }
    }));

    it('Nexus Report widget is configured in the dashboard', function(){
        this.init();

        var nexusWidget = dashboardProvider.widgets['nexus-evaluation-reports'];
        expect(nexusWidget).toBeDefined();
        expect(nexusWidget.templateUrl).toBe("partials/widgets/nexusReport.html");
        expect(nexusWidget.title).toBe("Nexus Evaluation Reports");

        expect($scope.nexusApps.length).toBe(0);
        expect($scope.showConfigModal).toBe(false);
        expect($scope.errorStatus).toBe(null);
        expect($scope.widget).toEqual(testUtils.getNexusWidget());

    });

    xit('showWidgetConfigModal will call config to populate nexus apps', function(){
        httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/nexus/widget/' + 1 + "/report").respond([]);

        this.init();

        httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/nexus/widget/' + 1 + "/config").respond();

        $scope.showWidgetConfigModal();

        $scope.$digest();
        httpBackend.flush();

        expect($scope.nexusApps.length).not.toBe(0);

    });

});
