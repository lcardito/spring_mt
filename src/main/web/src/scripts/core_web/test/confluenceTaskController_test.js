
var baseUrl = 'http://www.example.com';

describe('Test Confluence Task Controller', function() {

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

            controller = $controller('confluenceTaskController', {
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

    it('Confluence task controller is configured in dashboard', function(){
        this.init({enableDone: false});
        var confluenceTaskWidget = dashboardProvider.widgets['confluence-tasks'];
        expect(confluenceTaskWidget).toBeDefined();
        expect(confluenceTaskWidget.reload).toBe(false);
        expect(confluenceTaskWidget.title).toBe('Tasks');
        expect(confluenceTaskWidget.description).toBe('Up to date list of all your tasks in from Confluence');
        expect(confluenceTaskWidget.templateUrl).toBe('partials/widgets/confluence.html');
        expect(confluenceTaskWidget.controller).toBe('confluenceTaskController');

        expect($scope.data.showRefreshOptions).toBe(true);
        expect($scope.data.enableDone).toBe(false);
        expect($scope.data.appUrl).toBe('');
        expect($scope.data.method).toBe('tasks');
        expect($scope.data.windowTitle).toBe('My Test Confluence widget');
        expect($scope.data.autoRefresh).toBe('0');
        expect($scope.data.titleBgColor).toBe('#374049');
        expect($scope.data.titleTxtColor).toBe('#FFFFFF');
        expect($scope.data.minicolorsSettings).toEqual({ theme: 'bootstrap', position: 'bottom right', letterCase: 'uppercase' });
    });

    it('Confluence only TODO tasks can be displayed', function(){
        this.init({enableDone: false});

        httpBackend.expectGET(getTaskAPIUrl + '?showDone=false').respond(200, [todoTask]);

        spyOn(arrayTableModelServiceMock, 'createArrayTableModel').and.callFake(function(rows, callback, boolean, headers){
            expect(rows.length).toBe(1);

            var resultRow = callback(rows[0]);
            expect(resultRow.checked).toBe(false);
            expect(resultRow.data).toEqual(rows[0]);
            expect(resultRow.data.prettyDetails).toEqual('This is my task one description');
            expect(resultRow.data.prettyTitle).toEqual('This is my page one title');
            expect(resultRow.external).toBe(true);
            expect(resultRow.url).toEqual('http://confluence.clearvision.com/myTodoTask/url');
            expect(boolean).toBe(true);
            expect(headers).toEqual(['prettyTitle', 'prettyDetails']);
        });

        $scope.$digest();
        httpBackend.flush();

        expect(arrayTableModelServiceMock.createArrayTableModel).toHaveBeenCalled();
        expect(arrayTableModelServiceMock.createArrayTableModel.calls.count()).toBe(1);

    });

    it('Confluence all tasks can be displayed', function(){
        this.init({enableDone: true});

        httpBackend.expectGET(getTaskAPIUrl + '?showDone=true').respond(200, [todoTask, doneTask]);

        spyOn(arrayTableModelServiceMock, 'createArrayTableModel').and.callFake(function(rows, callback, boolean, headers){
            expect(rows.length).toBe(2);

            var resultRow = callback(rows[0]);
            expect(resultRow.checked).toBe(false);

            resultRow = callback(rows[1]);
            expect(resultRow.checked).toBe(true);
        });

        $scope.$digest();
        httpBackend.flush();

        expect(arrayTableModelServiceMock.createArrayTableModel).toHaveBeenCalled();
        expect(arrayTableModelServiceMock.createArrayTableModel.calls.count()).toBe(1);
    });

    it('Onchange callback for task checkbox will call api backend to update the task to TODO', function(){
        this.init({enableDone: true});
        httpBackend.expectGET(getTaskAPIUrl + '?showDone=true').respond(200, [todoTask, doneTask]);

        var editTaskRequest = {
            status: 'DONE',
            remoteId: {
                taskId: todoTask.remoteId.taskId,
                contentId: todoTask.remoteId.contentId
            }
        };

        var taskUpdated = false;
        spyOn(arrayTableModelServiceMock, 'createArrayTableModel').and.callFake(function(rows, callback, boolean, headers){
            var taskTodo = callback(rows[0]);
            expect(taskTodo.updateTaskCallback).toEqual(jasmine.any(Function));

            if(!taskUpdated) {
                httpBackend.expectPUT(baseUrl + '/rest-with-cookies/api/v1/task/confluence/2/' + todoTask.remoteId.taskId,  editTaskRequest).respond(201);

                taskTodo.updateTaskCallback(rows[0]);
                taskUpdated = true;
            }
        });

        $scope.$digest();
        httpBackend.flush();
    });

    it('Onchange callback for task checkbox will call api backend to update the task to DONE', function(){
        this.init({enableDone: true});
        httpBackend.expectGET(getTaskAPIUrl + '?showDone=true').respond(200, [todoTask, doneTask]);

        var editTaskRequest = {
            status: 'TODO',
            remoteId: {
                taskId: doneTask.remoteId.taskId,
                contentId: doneTask.remoteId.contentId
            }
        };

        var taskUpdated = false;
        spyOn(arrayTableModelServiceMock, 'createArrayTableModel').and.callFake(function(rows, callback, boolean, headers){
            var taskTodo = callback(rows[1]);
            expect(taskTodo.updateTaskCallback).toEqual(jasmine.any(Function));

            if(!taskUpdated) {
                httpBackend.expectPUT(baseUrl + '/rest-with-cookies/api/v1/task/confluence/2/' + doneTask.remoteId.taskId,  editTaskRequest).respond(201);

                taskTodo.updateTaskCallback(rows[1]);
                taskUpdated = true;
            }
        });

        $scope.$digest();
        httpBackend.flush();
    });

    it('Will show a bootbox popup error if update fails', function() {
        this.init({enableDone: true});
        httpBackend.expectGET(getTaskAPIUrl + '?showDone=true').respond(200, [todoTask, doneTask]);

        var editTaskRequest = {
            status: 'TODO',
            remoteId: {
                taskId: doneTask.remoteId.taskId,
                contentId: doneTask.remoteId.contentId
            }
        };

        var taskUpdated = false;
        var oldBootbox = bootbox;
        bootbox = {
            alert: function(){}
        };

        spyOn(arrayTableModelServiceMock, 'createArrayTableModel').and.callFake(function(rows, callback, boolean, headers){
            var taskTodo = callback(rows[1]);

            if(!taskUpdated) {
                httpBackend.expectPUT(baseUrl + '/rest-with-cookies/api/v1/task/confluence/2/' + doneTask.remoteId.taskId, editTaskRequest).respond(404);

                httpBackend.expectGET(getTaskAPIUrl + '?showDone=true').respond(200, [todoTask, doneTask]);

                spyOn(bootbox, 'alert').and.callFake(function (message) {
                    expect(message).toBe('Sorry, an error occurred while updating task');
                });

                taskTodo.updateTaskCallback(rows[1]);
                taskUpdated = true;
            }
        });

        $scope.$digest();
        httpBackend.flush();
        bootbox = oldBootbox;
    });

    var todoTask = {
       'id': 1,
       'appId': '1',
       'status': 'TODO',
       'description': 'This is my task one description',
       'pageTitle': 'This is my page one title',
       'url': '/myTodoTask/url',
       'remoteId': {
           'contentId': 1900550,
           'taskId': 11
       }
   };

   var doneTask = {
      'id': 2,
      'appId': '1',
      'status': 'DONE',
      'description': 'This is my task two description',
      'pageTitle': 'This is my page two title',
      'remoteId': {
          'contentId': 1900550,
          'taskId': 22
      }
   };
});
