var baseUrl = "http://www.example.com";

describe('Test JIRA Sprint Monitor Controller', function() {

    var getSprintsAPIUrl = baseUrl + '/rest-with-cookies/api/v1/task/confluence/2';
    var exampleSprintResponse = {"id":123,"name":"Sprint 123","boardId":153,"boardName":"Card board"};
    var exampleSprintResponse2 = {"id":111,"name":"Sprint 21","boardId":31,"boardName":"I'm Bored"};
    var exampleSprintDetails = {"id":123,"name":"Sprint 1","totalDays":10,"remainingDays":8,"currentDay":2,"todoEstimate":2,"inProgressEstimate":4,"doneEstimate":6};

    beforeEach(module('personalisedDashboardModule'));

    var $scope,
        rootScope,
        controller,
        Restangular,
        httpBackend,
        angularSpy,
        arrayTableModelServiceMock,
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

        arrayTableModelServiceMock = jasmine.createSpyObj('arrayTableModelService', ['createArrayTableModel']);
        $scope.$parent.$parent = { editMode: false };
        angularSpy = spyOn(angular, 'element').and.returnValue(testUtils.getPersonalisedDashboardModel([testUtils.getConfluenceWidget()]));


        this.init = function(moreConfig){
            var widget = testUtils.getJIRAWidget();
            for(var prop in moreConfig){
                widget.config[prop] = moreConfig[prop];
            }

            $scope.config = widget.config;

            controller = $controller('jiraSprintMonitorController', {
                '$scope': $scope,
                'widget': widget,
                'arrayTableModelService': arrayTableModelServiceMock,
                Restangular: Restangular
            });
        }
    }));

    it('JIRA Sprint Monitor is configured in dashboard', function() {
        this.init();
        var jiraFilterWidget = dashboardProvider.widgets['jira-sprint-monitor'];
        expect(jiraFilterWidget).toBeDefined();
        expect(jiraFilterWidget.reload).toBe(false);
        expect(jiraFilterWidget.title).toBe('Sprint Monitor');
        expect(jiraFilterWidget.description).toBe('Monitoring the progress of a JIRA sprint');
        expect(jiraFilterWidget.templateUrl).toBe('partials/widgets/jira_sprint_monitor.html');
        expect(jiraFilterWidget.controller).toBe('jiraSprintMonitorController');

        expect($scope.data.showRefreshOptions).toBe(true);
        expect($scope.data.appUrl).toBe('');
        expect($scope.data.windowTitle).toBe('My Test JIRA widget');
        expect($scope.data.autoRefresh).toBe('0');
        expect($scope.data.titleBgColor).toBe('#374049');
        expect($scope.data.titleTxtColor).toBe('#FFFFFF');
        expect($scope.data.minicolorsSettings).toEqual({ theme: 'bootstrap', position: 'bottom right', letterCase: 'uppercase' });
    });

    it('On the load of the Controller, we call getSprintList then that does everything', function(){
        expectSprintListRequest();
        expectSprintDataRequest();

        this.init();
        $scope.$digest();
        httpBackend.flush();

        expect($scope.data.chosenSprint).toEqual($scope.data.sprintList[0]);
        expect($scope.sprintData.remainingDays).toEqual(8);
        expect($scope.sprintData.totalDays).toEqual(10);
        expect($scope.sprintData.currentDay).toEqual(2);
        expect($scope.sprintData.inProgressEstimate).toEqual(4);
        expect($scope.sprintData.percentComplete).toEqual(20);
        expect($scope.sprintData.totalEstimate).toEqual(12);
        expect(parseInt($scope.sprintData.todoPercent, 10)).toEqual(16);
        expect(parseInt($scope.sprintData.inProgressPercent, 10)).toEqual(33);
        expect(parseInt($scope.sprintData.donePercent, 10)).toEqual(50);
        expect(parseInt($scope.sprintData.sprintVariance, 10)).toEqual(150);
        expect($scope.sprintData.varianceColour).toEqual("5cb85c");

    });

    it('Sprint Monitor with no estimates on all the issues', function(){
        var exampleSprintDetailsNoEstimates = {"id":2,"name":"Sprint No Issues","totalDays":10,"remainingDays":8,"currentDay":2,"todoEstimate":0,"inProgressEstimate":0,"doneEstimate":0};
        expectSprintListRequest();
        httpBackend.expectGET(baseUrl + "/rest-with-cookies/api/v1/application/1/jira/sprint/123?boardName=Card+board").respond(200, exampleSprintDetailsNoEstimates);

        this.init();
        $scope.$digest();
        httpBackend.flush();

        expect($scope.data.chosenSprint).toEqual($scope.data.sprintList[0]);
        expect($scope.sprintData.remainingDays).toEqual(8);
        expect($scope.sprintData.totalDays).toEqual(10);
        expect($scope.sprintData.currentDay).toEqual(2);
        expect($scope.sprintData.inProgressEstimate).toEqual(0);
        expect($scope.sprintData.percentComplete).toEqual(20);
        expect($scope.sprintData.totalEstimate).toEqual(0);
        expect(parseInt($scope.sprintData.todoPercent, 10)).toEqual(0);
        expect(parseInt($scope.sprintData.inProgressPercent, 10)).toEqual(0);
        expect(parseInt($scope.sprintData.donePercent, 10)).toEqual(100);
        expect(parseInt($scope.sprintData.sprintVariance, 10)).toEqual(400);
        expect($scope.sprintData.varianceColour).toEqual("5cb85c");
    });

    it('Sprint Monitor Everything in todo', function(){
        var exampleSprintDetailsAllInTODO = {"id":2,"name":"Sprint No Issues","totalDays":10,"remainingDays":8,"currentDay":2,"todoEstimate":45,"inProgressEstimate":0,"doneEstimate":0};
        expectSprintListRequest();
        httpBackend.expectGET(baseUrl + "/rest-with-cookies/api/v1/application/1/jira/sprint/123?boardName=Card+board").respond(200, exampleSprintDetailsAllInTODO);

        this.init();
        $scope.$digest();
        httpBackend.flush();

        expect($scope.data.chosenSprint).toEqual($scope.data.sprintList[0]);
        expect($scope.sprintData.remainingDays).toEqual(8);
        expect($scope.sprintData.totalDays).toEqual(10);
        expect($scope.sprintData.currentDay).toEqual(2);
        expect($scope.sprintData.inProgressEstimate).toEqual(0);
        expect($scope.sprintData.percentComplete).toEqual(20);
        expect($scope.sprintData.totalEstimate).toEqual(45);
        expect(parseInt($scope.sprintData.todoPercent, 10)).toEqual(100);
        expect(parseInt($scope.sprintData.inProgressPercent, 10)).toEqual(0);
        expect(parseInt($scope.sprintData.donePercent, 10)).toEqual(0);
        expect(parseInt($scope.sprintData.sprintVariance, 10)).toEqual(-100);
        expect($scope.sprintData.varianceColour).toEqual("d9534f");
    });

    it('Sprint Monitor Everything in Progress', function(){
        var exampleSprintDetailsAllInProgress = {"id":2,"name":"Sprint No Issues","totalDays":10,"remainingDays":8,"currentDay":2,"todoEstimate":0,"inProgressEstimate":45,"doneEstimate":0};
        expectSprintListRequest()
        httpBackend.expectGET(baseUrl + "/rest-with-cookies/api/v1/application/1/jira/sprint/123?boardName=Card+board").respond(200, exampleSprintDetailsAllInProgress);

        this.init();
        $scope.$digest();
        httpBackend.flush();

        expect($scope.data.chosenSprint).toEqual($scope.data.sprintList[0]);
        expect($scope.sprintData.remainingDays).toEqual(8);
        expect($scope.sprintData.totalDays).toEqual(10);
        expect($scope.sprintData.currentDay).toEqual(2);
        expect($scope.sprintData.inProgressEstimate).toEqual(45);
        expect($scope.sprintData.percentComplete).toEqual(20);
        expect($scope.sprintData.totalEstimate).toEqual(45);
        expect(parseInt($scope.sprintData.todoPercent, 10)).toEqual(0);
        expect(parseInt($scope.sprintData.inProgressPercent, 10)).toEqual(100);
        expect(parseInt($scope.sprintData.donePercent, 10)).toEqual(0);
        expect(parseInt($scope.sprintData.sprintVariance, 10)).toEqual(-100);
        expect($scope.sprintData.varianceColour).toEqual("d9534f");
    });

    it('Sprint Monitor Everything in Done', function(){
      var exampleSprintDetailsAllInDONE = {"id":2,"name":"Sprint No Issues","totalDays":10,"remainingDays":8,"currentDay":2,"todoEstimate":0,"inProgressEstimate":0,"doneEstimate":45};
        expectSprintListRequest()
        httpBackend.expectGET(baseUrl + "/rest-with-cookies/api/v1/application/1/jira/sprint/123?boardName=Card+board").respond(200, exampleSprintDetailsAllInDONE);

        this.init();
        $scope.$digest();
        httpBackend.flush();

        expect($scope.data.chosenSprint).toEqual($scope.data.sprintList[0]);
        expect($scope.sprintData.remainingDays).toEqual(8);
        expect($scope.sprintData.totalDays).toEqual(10);
        expect($scope.sprintData.currentDay).toEqual(2);
        expect($scope.sprintData.inProgressEstimate).toEqual(0);
        expect($scope.sprintData.percentComplete).toEqual(20);
        expect($scope.sprintData.totalEstimate).toEqual(45);
        expect(parseInt($scope.sprintData.todoPercent, 10)).toEqual(0);
        expect(parseInt($scope.sprintData.inProgressPercent, 10)).toEqual(0);
        expect(parseInt($scope.sprintData.donePercent, 10)).toEqual(100);
        expect(parseInt($scope.sprintData.sprintVariance, 10)).toEqual(400);
        expect($scope.sprintData.varianceColour).toEqual("5cb85c");
    });

    it('Sprint Monitor End of Sprint 0 days remaining', function(){
        var exampleSprintDetailsWithNODaysRemaining= {"id":2,"name":"Sprint No Issues","totalDays":10,"remainingDays":0,"currentDay":10,"todoEstimate":5,"inProgressEstimate":15,"doneEstimate":20};
        expectSprintListRequest()
        httpBackend.expectGET(baseUrl + "/rest-with-cookies/api/v1/application/1/jira/sprint/123?boardName=Card+board").respond(200, exampleSprintDetailsWithNODaysRemaining);

        this.init();
        $scope.$digest();
        httpBackend.flush();

        expect($scope.data.chosenSprint).toEqual($scope.data.sprintList[0]);
        expect($scope.sprintData.remainingDays).toEqual(0);
        expect($scope.sprintData.totalDays).toEqual(10);
        expect($scope.sprintData.currentDay).toEqual(10);
        expect($scope.sprintData.inProgressEstimate).toEqual(15);
        expect($scope.sprintData.percentComplete).toEqual(100);
        expect($scope.sprintData.totalEstimate).toEqual(40);
        expect(parseInt($scope.sprintData.todoPercent, 10)).toEqual(12);
        expect(parseInt($scope.sprintData.inProgressPercent, 10)).toEqual(37);
        expect(parseInt($scope.sprintData.donePercent, 10)).toEqual(50);
        expect(parseInt($scope.sprintData.sprintVariance, 10)).toEqual(-50);
        expect($scope.sprintData.varianceColour).toEqual("d9534f");
    });

    it('Sprint Monitor start of Sprint all Days Remaining', function(){
        var exampleSprintDetailsWithAllDaysRemaining= {"id":2,"name":"Sprint No Issues","totalDays":10,"remainingDays":10,"currentDay":0,"todoEstimate":5,"inProgressEstimate":15,"doneEstimate":20};
        expectSprintListRequest()
        httpBackend.expectGET(baseUrl + "/rest-with-cookies/api/v1/application/1/jira/sprint/123?boardName=Card+board").respond(200, exampleSprintDetailsWithAllDaysRemaining);

        this.init();
        $scope.$digest();
        httpBackend.flush();

        expect($scope.data.chosenSprint).toEqual($scope.data.sprintList[0]);
        expect($scope.sprintData.remainingDays).toEqual(10);
        expect($scope.sprintData.totalDays).toEqual(10);
        expect($scope.sprintData.currentDay).toEqual(0);
        expect($scope.sprintData.inProgressEstimate).toEqual(15);
        expect($scope.sprintData.percentComplete).toEqual(0);
        expect($scope.sprintData.totalEstimate).toEqual(40);
        expect(parseInt($scope.sprintData.todoPercent, 10)).toEqual(12);
        expect(parseInt($scope.sprintData.inProgressPercent, 10)).toEqual(37);
        expect(parseInt($scope.sprintData.donePercent, 10)).toEqual(50);
        expect(parseInt($scope.sprintData.sprintVariance, 10)).toEqual(0);
        expect($scope.sprintData.varianceColour).toEqual("5cb85c");
    });

    var sprintList = [exampleSprintResponse, exampleSprintResponse2];

    function expectSprintListRequest() {
        httpBackend.expectGET(baseUrl + "/rest-with-cookies/api/v1/application/1/jira/sprint").respond(200, sprintList);
    }

    function expectSprintDataRequest() {
        httpBackend.expectGET(baseUrl + "/rest-with-cookies/api/v1/application/1/jira/sprint/123?boardName=Card+board").respond(200, exampleSprintDetails);
    }

});
