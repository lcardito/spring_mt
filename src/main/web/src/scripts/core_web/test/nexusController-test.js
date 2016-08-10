'user strict'
var baseUrl = "http://www.example.com"

describe('Test Nexus Reports Controller', function() {
	var nexusConfig = [
			{"name":"webgoat", "internalId":"0c8e18c318d24daa806d02ee36bb50bc", "showLicenseData": "true", "showSecurityData": "true", "selected": "true", "reports": [{"stage": "build", "selected": "true"}, {"stage": "deploy", "selected": "false"}]},
			{"name":"spectrum", "internalId":"0c8e18c318d24daa806d02ee36bb50bb", "showLicenseData": "true", "showSecurityData": "false", "selected": "false", "reports": [{"stage": "build", "selected": "false"}, {"stage": "deploy", "selected": "true"}]}
		];
    beforeEach(module('personalisedDashboardModule'));

    var $scope,
        rootScope,
        controller,
        Restangular,
        httpBackend,
        angularSpy,
        dashboardProvider;

       beforeEach(inject(function ($rootScope, _Restangular_, _$httpBackend_, $controller, getAppsOfType, _dashboard_) {
			rootScope = $rootScope;
			$scope = $rootScope.$new();
			Restangular = _Restangular_;
			httpBackend = _$httpBackend_;
			dashboardProvider = _dashboard_;

			httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/application/supported-application').respond(testUtils.getSupportedApps());
			httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/application/installed-application').respond(testUtils.getAvailableApps());
			httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/users/user-auth-state').respond(testUtils.getUserAuthState());

			angularSpy = spyOn(angular, 'element').and.returnValue(testUtils.getPersonalisedDashboardModel([testUtils.getNexusWidget()]));
			jiraRestTableModelServiceMock = jasmine.createSpyObj('jiraRestTableModelService', ['createRestTableModel']);

			this.init = function(moreConfig){
			    var config = {id: 2};
			    for(var prop in moreConfig){
			        config[prop] = moreConfig[prop];
			    }
			    $scope.config = config;

			    controller = $controller('nexusReportController', {
			        '$scope': $scope,
			        'config': config,
			        'arrayTableModelService': arrayTableModelService,
			        'Restangular': Restangular
			    });
			}
		}));

});