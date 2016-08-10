'use strict';

describe('Test JIRA Controller', function() {

    beforeEach(module('personalisedDashboardModule'));

    var $scope,
        rootScope,
        controller,
        Restangular,
        httpBackend,
        angularSpy,
        taskTimer,
        widgetCommentService,
        taskTimerItem,
        dashboardGET,
        dashboard;

    afterEach(function() {
        angularSpy.and.callThrough();
    });

	beforeEach(inject(function ($rootScope, _Restangular_, _$httpBackend_, $controller, _taskTimer_) {
        rootScope = $rootScope;
        $scope = $rootScope.$new();
        Restangular = _Restangular_;
        httpBackend = _$httpBackend_;
        taskTimer = _taskTimer_;

		var supportedApps = [{
			id: "1",
			name: "JIRA"
		}];
		var availableApps = [{
			id: "1",
			supportedAppId: "1",
			type: "JIRA",
			linkConfigured: true
		}];
		var dashboards = [ {"id" : "1"} ];
		dashboard = {
			"id" : 1,
			"userId" : 1,
			"title" : "Personalised Dashboard",
			"structure" : "(1) Header with two columns",
			"refreshInterval" : null,
			"columns" : [ {
				"widgets" : [ {
					"id" : 6,
					"dashboardId" : 1,
					"type" : "application-list",
					"columnNumber" : 0,
					"widgetOrder" : 0,
					"title" : "Application List",
					"autoRefresh" : null,
					"bgColor" : "#374049",
					"txtColor" : "#FFFFFF",
					"config" : {
						"gridLayout" : true
					}
				} ]
			}, {
				"widgets" : [ {
					"id" : 7,
					"dashboardId" : 1,
					"type" : "bookmarks",
					"columnNumber" : 1,
					"widgetOrder" : 0,
					"title" : "Bookmarks",
					"autoRefresh" : null,
					"bgColor" : "#374049",
					"txtColor" : "#FFFFFF",
					"config" : {}
				} ]
			}, {
				"widgets" : [ {
					"id" : 8,
					"dashboardId" : 1,
					"type" : "confluence-notifications",
					"columnNumber" : 2,
					"widgetOrder" : 0,
					"title" : "Notifications",
					"autoRefresh" : null,
					"bgColor" : "#374049",
					"txtColor" : "#FFFFFF",
					"config" : {}
				} ]
			} ]
		};
        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/users/user-auth-state").respond(testUtils.getUserAuthState());
        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/installed-application").respond(availableApps);
        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/supported-application").respond(supportedApps);
        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/dashboard").respond(dashboards);
        dashboardGET = httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/dashboard/1");
        dashboardGET.respond(dashboard);
        httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/message").respond({"payload": "{}"});
        httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/1/jira/issue/TEST-1?fields=summary").respond({ summary: "TEST summary" });

        angularSpy = spyOn(angular, 'element').and.returnValue(testUtils.getPersonalisedDashboardModel([testUtils.getConfluenceWidget()]));

		this.init = function(moreConfig){
			var config = {id: 1};
			for(var prop in moreConfig){
				config[prop] = moreConfig[prop];
			}
			$scope.config = config;

			controller = $controller('personalisedDashboardController', {
				'$scope': $scope,
				'config': config,
				'Restangular': Restangular
			});
		}
    }));

    afterEach(function() {

    });

    it('TaskTimer get active timers. getActiveTimers gets called as part of the controller load phase', function() {
    	httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/task-timer").respond(testUtils.getTaskTimers());
    	this.init();
        $scope.$digest();
        httpBackend.flush();

        expect($scope.activeTaskTimers.length).toEqual(1);
        expect($scope.activeTaskTimers[0].appId).toEqual(1);
        expect($scope.activeTaskTimers[0].remoteId).toEqual("TEST-1");
        expect($scope.activeTaskTimers[0].startTime).toBeDefined();
        expect($scope.activeTaskTimers[0].startTime).not.toBeNull();
        expect($scope.activeTaskTimers[0].summary).toEqual("TEST summary");
    });

    it('TaskTimer can start new task timer', function() {
        var whenGetTaskTimers = httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/task-timer");
        whenGetTaskTimers.respond([]);

        this.init();
        $scope.$digest();
        httpBackend.flush();

        expect($scope.activeTaskTimers.length).toEqual(0);

        httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/task-timer/start", function(data) {
            var requestData = JSON.parse(data);
            expect(requestData.appId).toBe(1);
            expect(requestData.remoteId).toBe('TEST-1');
            return true;
        }).respond(200, {
            successCompletedTaskTimer: true
        });
        whenGetTaskTimers.respond(testUtils.getTaskTimers());

        taskTimer.start(testUtils.getAvailableApps()[0], testUtils.getTaskTimers()[0].remoteId);
        $(".bootbox button[data-bb-handler='confirm']").click();
        rootScope.$digest();
        httpBackend.flush();

        expect($scope.activeTaskTimers.length).toEqual(1);
    });

	it('TaskTimer can stop active timer', function() {
        var whenGetTaskTimers = httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/task-timer");
        whenGetTaskTimers.respond(testUtils.getTaskTimers());

		this.init();
		$scope.$digest();
		httpBackend.flush();

		expect($scope.activeTaskTimers.length).toEqual(1);

        httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/task-timer/" + testUtils.getTaskTimers()[0].id + "/stop").respond(200, {
            successCompletedTaskTimer: true
        });
        whenGetTaskTimers.respond([]);

        taskTimer.stop(testUtils.getAvailableApps()[0], testUtils.getTaskTimers()[0].id);
        $(".bootbox button[data-bb-handler='confirm']").click();
        rootScope.$digest();
		httpBackend.flush();

		expect($scope.activeTaskTimers.length).toEqual(0);
	});

	it('Layout can be restored', function() {
		httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/task-timer").respond(testUtils.getTaskTimers());
		this.init();
		$scope.$digest();
		httpBackend.flush();

		expect($scope.model.id).toEqual(1);
		expect($scope.model.structure).toEqual("(1) Header with two columns");
		expect($scope.model.title).toEqual("Personalised Dashboard");
		expect($scope.model.rows).toEqual([
           {
				columns : [ {
					styleClass : 'col-md-12',
					widgets : [ {
						id : 6,
						dashboardId : 1,
						type : 'application-list',
						columnNumber : 0,
						widgetOrder : 0,
						title : 'Application List',
						autoRefresh : null,
						bgColor : '#374049',
						txtColor : '#FFFFFF',
						config : {
							gridLayout : true
						},
						titleTemplateUrl : 'partials/widgets/widgetTitleTemplate.html'
					} ]
				} ]
			},
			{
				columns : [ {
					styleClass : 'col-md-6',
					widgets : [ {
						id : 7,
						dashboardId : 1,
						type : 'bookmarks',
						columnNumber : 1,
						widgetOrder : 0,
						title : 'Bookmarks',
						autoRefresh : null,
						bgColor : '#374049',
						txtColor : '#FFFFFF',
						config : {},
						titleTemplateUrl : 'partials/widgets/widgetTitleTemplate.html'
					} ]
				},
				{
					styleClass : 'col-md-6',
					widgets : [ {
						id : 8,
						dashboardId : 1,
						type : 'confluence-notifications',
						columnNumber : 2,
						widgetOrder : 0,
						title : 'Notifications',
						autoRefresh : null,
						bgColor : '#374049',
						txtColor : '#FFFFFF',
						config : {},
						titleTemplateUrl : 'partials/widgets/widgetTitleTemplate.html'
					} ]
				} ]
			} ]);
	});

	it('Layout can be saved', function() {
		httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/task-timer").respond(testUtils.getTaskTimers());
		httpBackend.whenPUT(baseUrl + "/rest-with-cookies/api/v1/dashboard/1/widget/6").respond({});
		httpBackend.whenPUT(baseUrl + "/rest-with-cookies/api/v1/dashboard/1/widget/7").respond({});
		httpBackend.whenPUT(baseUrl + "/rest-with-cookies/api/v1/dashboard/1/widget/8").respond({});

		this.init();
		$scope.$digest();
		httpBackend.flush();

		httpBackend.expectPUT(baseUrl + "/rest-with-cookies/api/v1/dashboard/1", {
			"refreshInterval":null,
			"structure":"(1) Header with two columns",
			"title":"Personalised Dashboard",
			"columns":[ {
				"widgets":[{
					"id":6
				}]
			},
			{
				"widgets":[{
					"id":7
				}]
			},
			{
				"widgets":[{
					"id":8
				}]
			}]
		}).respond({});

		rootScope.$broadcast('adfDashboardChanged');
		httpBackend.flush();

		httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
	});

	it('New widgets must be saved when saving layout', function() {
	    httpBackend.whenPUT(baseUrl + "/rest-with-cookies/api/v1/dashboard/1/widget/6").respond({});
		httpBackend.whenPUT(baseUrl + "/rest-with-cookies/api/v1/dashboard/1/widget/7").respond({});
		httpBackend.whenPUT(baseUrl + "/rest-with-cookies/api/v1/dashboard/1/widget/8").respond({});

		httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/task-timer").respond(testUtils.getTaskTimers());
		this.init();
		$scope.$digest();
		httpBackend.flush();

		var newWidget = {
			"type" : "application-list",
			"title" : "New Application List",
			"autoRefresh" : null,
			"bgColor" : "#374049",
			"txtColor" : "#FFFFFF",
			"config" : {
				"something": "configured"
			}
		};
		$scope.model.rows[0].columns[0].widgets.unshift(newWidget);

		httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/dashboard/1/widget", newWidget).respond({id: 9});
		httpBackend.expectPUT(baseUrl + "/rest-with-cookies/api/v1/dashboard/1", {
			"refreshInterval":null,
			"structure":"(1) Header with two columns",
			"title":"Personalised Dashboard",
			"columns":[ {
				"widgets":[{
					"id":9
				}, {
					"id":6
				}]
			},
			{
				"widgets":[{
					"id":7
				}]
			},
			{
				"widgets":[{
					"id":8
				}]
			}]
		}).respond({});

		rootScope.$broadcast('adfDashboardChanged');
		httpBackend.flush();

		httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
	});

	it('Layout can be restored even the structure name is not valid', function() {
		httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/task-timer").respond(testUtils.getTaskTimers());
		dashboard.structure = "INVALID_NAME";
		dashboardGET.respond(dashboard);
		this.init();
		$scope.$digest();
		httpBackend.flush();

		expect($scope.model.id).toEqual(1);
		expect($scope.model.structure).toEqual("(1) Header with two columns");
		expect($scope.model.title).toEqual("Personalised Dashboard");
		expect($scope.model.rows).toEqual([
           {
				columns : [ {
					styleClass : 'col-md-12',
					widgets : [ {
						id : 6,
						dashboardId : 1,
						type : 'application-list',
						columnNumber : 0,
						widgetOrder : 0,
						title : 'Application List',
						autoRefresh : null,
						bgColor : '#374049',
						txtColor : '#FFFFFF',
						config : {
							gridLayout : true
						},
						titleTemplateUrl : 'partials/widgets/widgetTitleTemplate.html'
					} ]
				} ]
			},
			{
				columns : [ {
					styleClass : 'col-md-6',
					widgets : [ {
						id : 7,
						dashboardId : 1,
						type : 'bookmarks',
						columnNumber : 1,
						widgetOrder : 0,
						title : 'Bookmarks',
						autoRefresh : null,
						bgColor : '#374049',
						txtColor : '#FFFFFF',
						config : {},
						titleTemplateUrl : 'partials/widgets/widgetTitleTemplate.html'
					} ]
				},
				{
					styleClass : 'col-md-6',
					widgets : [ {
						id : 8,
						dashboardId : 1,
						type : 'confluence-notifications',
						columnNumber : 2,
						widgetOrder : 0,
						title : 'Notifications',
						autoRefresh : null,
						bgColor : '#374049',
						txtColor : '#FFFFFF',
						config : {},
						titleTemplateUrl : 'partials/widgets/widgetTitleTemplate.html'
					} ]
				} ]
			} ]);
	});
});
