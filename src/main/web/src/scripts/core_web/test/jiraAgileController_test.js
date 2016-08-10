
var baseUrl = "http://www.example.com";

describe('Test JIRA Agile Controller', function() {

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

        angularSpy = spyOn(angular, 'element').and.returnValue(testUtils.getPersonalisedDashboardModel([testUtils.getConfluenceWidget()]));


        arrayTableModelServiceMock = jasmine.createSpyObj('arrayTableModelService', ['createArrayTableModel']);
        $scope.$parent.$parent = { editMode: false };

        this.init = function(moreConfig){
            var widget = testUtils.getJIRAWidget();
            for(var prop in moreConfig){
                widget.config[prop] = moreConfig[prop];
            }
            $scope.config = widget.config;

            controller = $controller('jiraAgileController', {
                '$scope': $scope,
                'widget': widget,
                'arrayTableModelService': arrayTableModelServiceMock,
                Restangular: Restangular
            });
        }
    }));

    it('JIRA Agile Board is configured in dashboard', function(){
        this.init();
        var jiraFilterWidget = dashboardProvider.widgets['jira-agile'];
        expect(jiraFilterWidget).toBeDefined();
        expect(jiraFilterWidget.reload).toBe(false);
        expect(jiraFilterWidget.title).toBe('Agile Boards');
        expect(jiraFilterWidget.description).toBe('Results of an Agile Board from JIRA');
        expect(jiraFilterWidget.templateUrl).toBe('partials/widgets/jira_agile.html');
        expect(jiraFilterWidget.controller).toBe('jiraAgileController');

        expect($scope.data.showRefreshOptions).toBe(true);
        expect($scope.data.appUrl).toBe('');
        expect($scope.data.windowTitle).toBe('My Test JIRA widget');
        expect($scope.data.autoRefresh).toBe('0');
        expect($scope.data.titleBgColor).toBe('#374049');
        expect($scope.data.titleTxtColor).toBe('#FFFFFF');
        expect($scope.data.minicolorsSettings).toEqual({ theme: 'bootstrap', position: 'bottom right', letterCase: 'uppercase' });
    });

    it('On the load of the Controller, we call getBoardList then that does everything', function(){
        this.init({boardId: 1});
        expectBoardListRequest();
        expectBoardColumnsRequest();

        var issueForAgileBoardJsonRequest = {"type":"jira","method":"getIssuesForAgileBoard","appId":1,"payload":{"boardId":1,"boardType":"scrum","boardColumn":"To Do"}};
        httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message", issueForAgileBoardJsonRequest)
            .respond(200, issueForAgileBoardJson);

        $scope.$digest();
        httpBackend.flush();

        expect($scope.data.chosenBoard).toEqual(boardList.values[0]);
        expect($scope.data.appUrl).toBe(boardList.values[0].url);
        expect($scope.data.boardColumns).toEqual([{ name: '-- All columns --', isAllColumns: true }, { name: 'To Do' }, { name: 'In Progress' }, { name: 'Done' }]);
        expect($scope.data.chosenColumn).toEqual({name: "To Do"});

        expect(arrayTableModelServiceMock.createArrayTableModel)
            .toHaveBeenCalledWith(
                JSON.parse(issueForAgileBoardJson.payload).issues,
                jasmine.any(Function),
                false,
                ["key", "name", "status", "project"]
            );
    });

    it('Can update scope when saving options', function() {
        this.init({boardId: 1});
        expectBoardListRequest();
        expectBoardColumnsRequest();

        var issueForAgileBoardJsonRequest = {"type":"jira","method":"getIssuesForAgileBoard","appId":1,"payload":{"boardId":1,"boardType":"scrum","boardColumn":"To Do"}}
        httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message", issueForAgileBoardJsonRequest)
            .respond(200, issueForAgileBoardJson);

        $scope.$digest();
        httpBackend.flush();

        $scope.data.chosenColumn.name = '-- All Columns --';
        $scope.saveOptions({$valid: true});

        issueForAgileBoardJsonRequest = {"type":"jira","method":"getIssuesForAgileBoard","appId":1,"payload":{"boardId":1,"boardType":"scrum","boardColumn":"-- All Columns --"}}
        httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message", issueForAgileBoardJsonRequest)
            .respond(200, issueForAgileBoardJson);

        var saveWidgetJsonRequest = {"config":{"boardId":1,"chosenApp":1,"boardType":"scrum","filterOn":"-- All Columns --","chosenBoard":1,"chosenColumn":"-- All Columns --"},"title":"My Test JIRA widget","autoRefresh":"0","bgColor":"#374049","txtColor":"#FFFFFF"};
        httpBackend.expectPUT(baseUrl + "/rest-with-cookies/api/v1/dashboard/3/widget/1", saveWidgetJsonRequest)
            .respond(200, saveWidgetJsonRequest);

        $scope.$digest();
        httpBackend.flush();
        expect($scope.data.chosenBoard).toEqual(boardList.values[0]);
        expect($scope.data.appUrl).toBe(boardList.values[0].url);
        expect($scope.data.boardColumns).toEqual([{ name: '-- All columns --', isAllColumns: true }, { name: '-- All Columns --'}, { name: 'In Progress' }, { name: 'Done' }]);
        expect($scope.data.chosenColumn).toEqual({name: "-- All Columns --"});

        expect(arrayTableModelServiceMock.createArrayTableModel)
            .toHaveBeenCalledWith(
                JSON.parse(issueForAgileBoardJson.payload).issues,
                jasmine.any(Function),
                false,
                ["key", "name", "status", "project"]
            );

        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    var boardList = {
        "values": [{
            "name": "Card board",
            "self": "http://localhost:9876/jira/rest/agile/1.0/board/1",
            "id": 1,
            "type": "scrum"
        }, {
            "name": "Black board",
            "self": "http://localhost:9876/jira/rest/agile/1.0/board/2",
            "id": 2,
            "type": "kanban"
        }]
    };

    function expectBoardListRequest(){
        var agileBoardListJsonRequest = {"type":"jira","method":"getAgileBoardList","payload":null,"appId": 1};
        httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message",  agileBoardListJsonRequest)
            .respond(200, {
                payload: JSON.stringify(boardList)
        });
    }

    var boardColumns = {
        "self": "http://localhost:9876/jira/rest/agile/1.0/board/1/configuration",
        "filter": {
            "id": "10100",
            "self": "http://localhost:9876/jira/rest/api/2/filter/10100"
        },
        "columnConfig": {
            "columns": [{
                "name": "To Do",
            }, {
                "name": "In Progress",
            }, {
                "name": "Done",
            }]
        }
    };

    function expectBoardColumnsRequest(){
        expectedJsonRequest = {"type":"jira","method":"getAgileBoardColumns","payload":{"boardId":1},"appId":1};
        httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message",  expectedJsonRequest)
            .respond(200, {
                payload: JSON.stringify(boardColumns)
            });
    };

});
