'use strict';

describe('Test Application Table Module', function(){

	var element = '<application-table id="widget-result-table-1" rows="rows" order-by-initial="updated"></application-table>';

	beforeEach(module('applicationTableModule'), function(){
	});

	var $compile,
		$rootScope,
		$httpBackend,
		$scope,
		Restangular,
		arrayTableModelService;

	beforeEach(inject(function(_$compile_, _$rootScope_, _$httpBackend_, _Restangular_ , _arrayTableModelService_){
		$compile = _$compile_;
		$rootScope = _$rootScope_;
		$scope = $rootScope.$new();
		$httpBackend = _$httpBackend_;
		Restangular = _Restangular_;
		arrayTableModelService = _arrayTableModelService_;

		$httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/application/supported-application').respond(testUtils.getSupportedApps());
		$httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/application/installed-application').respond(testUtils.getAvailableApps());
		$httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/users/user-auth-state').respond(testUtils.getUserAuthState());
		$httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/installed-application/1/status").respond({status: "RUNNING"});
		$httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/installed-application/1/plugin-status").respond({ pluginStatus: "ENABLED" });
		$httpBackend.whenGET(new RegExp('\\' + 'partials/application-table.html')).respond("<table><thead></thead><tbody><tr id='row'><td><a href='javascript:void(0)'>test</a></td></tr></tbody></table>");
	}));

	arrayTableModelService = {
		createArrayTableModel: function(){}
	};

	var applicationTable;
	var intiApplicationTable = function() {
		var applicationTable = $compile(element)($scope);
		$('body').append(applicationTable);
		$httpBackend.flush();
		$scope.$digest();
		return applicationTable;
	};

	var app = {
        id: 1,
        supportedAppId: 1,
        type: "JIRA",
        linkConfigured: true,
        name: "My JIRA",
        supportedAppName: "JIRA"
    };

    var appNotLinked = {
        id: 1,
        supportedAppId: 1,
        type: "JIRA",
        linkConfigured: false,
        name: "My JIRA",
        supportedAppName: "JIRA"
    };

	it('Check if the apps has the Options', function() {
        spyOn(arrayTableModelService, 'createArrayTableModel').and.callFake(function (rows, callback, boolean, headers) {
            var action = callback(app).actions;
            expect(action.length).toBe(3);
            expect(action[2].name).toBe("Install Spectrum Plugins");
            expect(action[2].icon).toBe("circle-arrow-up");
        });

        var applicationTable = intiApplicationTable();
        $scope.$digest();
    });

    it('Check No Options if not Linked', function() {
            spyOn(arrayTableModelService, 'createArrayTableModel').and.callFake(function (rows, callback, boolean, headers) {
                var action = callback(appNotLinked).actions;
                console.log(action);
                expect(action.length).toBe(2);
            });

            var applicationTable = intiApplicationTable();
            $scope.$digest();
    });

    it('Check if the unsupported app has the Options', function() {
        spyOn(arrayTableModelService, 'createArrayTableModel').and.callFake(function (rows, callback, boolean, headers) {
            var action = callback({
                id: 1,
                supportedAppId: 1,
                type: "JIRA",
                linkConfigured: true,
                name: "My JIRA",
                supportedAppName: "Crowd"
            }).actions;
            expect(action.length).toBe(2);
        });

        var applicationTable = intiApplicationTable();
        $scope.$digest();
    });

    it('Check if the plugins installation gives the Correct Message on Success Request', function() {
		$httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/application/installed-application/1/install-plugins").respond(200, {});

   		spyOn(bootbox, 'alert').and.callFake(function(message, callback){
            expect(message).toBe("Spectrum plugins have been successfully installed");
        });

		spyOn(bootbox, 'confirm').and.callFake(function(message, callback){
			callback(true);
			expect(message).toBe("Do you want to install all Spectrum plugins in \"My JIRA\"?");
		});

		spyOn(arrayTableModelService, 'createArrayTableModel').and.callFake(function(rows, callback, boolean, headers){
			var action = callback(app).actions;
			action[2].run(app);
   		});

   		var applicationTable = intiApplicationTable();
    });

	it('Check if the plugins installation gives the Correct Message on Failed Request', function() {
		$httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/application/installed-application/1/install-plugins").respond(500, { message: "Cannot find spectrum-jira-utilities plugin when installing plugins in My JIRA" });

        spyOn(bootbox, 'alert').and.callFake(function (message, callback) {
            expect(message).toBe("Cannot find spectrum-jira-utilities plugin when installing plugins in My JIRA");
        });

		spyOn(bootbox, 'confirm').and.callFake(function(message, callback){
			callback(true);
			expect(message).toBe("Do you want to install all Spectrum plugins in \"My JIRA\"?");
		});

		spyOn(arrayTableModelService, 'createArrayTableModel').and.callFake(function(rows, callback, boolean, headers){
			var action = callback(app).actions;
			action[2].run(app);
		});

		var applicationTable = intiApplicationTable();
	});

    it('Check if the plugins installation gives the default Error Message on Failed Request', function() {
        $httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/application/installed-application/1/install-plugins").respond(500, {});

        spyOn(bootbox, 'alert').and.callFake(function (message, callback) {
            expect(message).toBe("Error occurred when installing Spectrum plugins");
        });

        spyOn(bootbox, 'confirm').and.callFake(function(message, callback){
            callback(true);
            expect(message).toBe("Do you want to install all Spectrum plugins in \"My JIRA\"?");
        });

        spyOn(arrayTableModelService, 'createArrayTableModel').and.callFake(function(rows, callback, boolean, headers){
            var action = callback(app).actions;
            action[2].run(app);
        });

        var applicationTable = intiApplicationTable();
    });
});
