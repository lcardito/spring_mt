'use strict';

var baseUrl = "http://www.example.com";

describe('Test Projects module', function() {

    beforeEach(module('projectsModule'));

    it('Validates module configuration', inject(function (DATE_FORMAT, Restangular, $state) {
        expect(DATE_FORMAT).toBe("MMM Do, YYYY h:mm:ss A");

        expect(Restangular.configuration.baseUrl).toBe(baseUrl + "/rest-with-cookies/api/v1");
        expect(Restangular.configuration.defaultHeaders).toBeDefined();
        expect(Restangular.configuration.defaultHeaders["Content-Type"]).toBe("application/json");

        expect($state.get("projects")).toBeDefined();
        expect($state.get("projects").abstract).toBe(true);
        expect($state.get("projects").url).toBe("/projects");
        expect($state.get("projects").template).toBe("<ui-view/>");
        expect($state.get("projects").data.breadcrumbProxy).toBe("projects.list");

        expect($state.get("projects.list")).toBeDefined();
        expect($state.get("projects.list").url).toBe("");
        expect($state.get("projects.list").templateUrl).toBe("partials/project-list.html");
        expect($state.get("projects.list").controller).toBe("ListController");
        expect($state.get("projects.list").data.displayName).toBe("Projects");

        expect($state.get("projects.create")).toBeDefined();
        expect($state.get("projects.create").url).toBe("/create");
        expect($state.get("projects.create").templateUrl).toBe("partials/project-create.html");
        expect($state.get("projects.create").controller).toBe("CreateController");
        expect($state.get("projects.create").data.displayName).toBe("Create Project");
    }));

    describe('Test ListController', function() {
        var $scope,
            rootScope,
            controller,
            Restangular,
            httpBackend,
            authStateService,
            restTableModelService;

        beforeEach(inject(function ($rootScope, _Restangular_, _$httpBackend_, $controller, _authStateService_, _restTableModelService_) {
            rootScope = $rootScope;
            $scope = $rootScope.$new();
            Restangular = _Restangular_;
            httpBackend = _$httpBackend_;
            authStateService = _authStateService_;
            restTableModelService = _restTableModelService_;

            controller = $controller('ListController', {
                '$scope': $scope,
                Restangular: Restangular,
                authStateService: authStateService,
                restTableModelService: restTableModelService
            });
        }));

        it('Display one project in two applications', function () {
            var availableApps = [{
                id: "1",
                supportedAppId: "1",
                url: "http://jira.example.com",
                type: "JIRA",
                linkConfigured: true
            }, {
                id: "2",
                supportedAppId: "2",
                url: "http://confluence.example.com",
                type: "Confluence",
                linkConfigured: true
            }];
            var supportedApps = [{
                id: "1",
                name: "JIRA"
            }, {
                id: "2",
                name: "Confluence"
            }];
            var projects = [{
                id: 1,
                name: "Test project",
                key: "TEST",
                description: "This is description",
                createdDate: new Date().getTime(),
                projectApplicationDetails: [{
                    id: 1,
                    jiraDetail: {
                        projectTemplateWebItemKey: "test",
                        projectTemplateModuleKey: "test"
                    },
                    confluenceDetail: null,
                    projectParameters: {
                    }
                }, {
                    id: 2,
                    jiraDetail: null,
                    confluenceDetail: {
                        spaceKey: "TEST",
                        createSpace: true,
                        parentPageId: null
                    },
                    projectParameters: {
                    }
                }],
                applicationIds: [1, 2]
            }];

            httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/users/user-auth-state").respond(testUtils.getUserAuthState());
            httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/installed-application").respond(availableApps);
            httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/supported-application").respond(supportedApps);
            httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/projects?limit=50").respond(projects);

            rootScope.$digest();
            httpBackend.flush();

            expect($scope.addActions).toEqual({
                name: 'Create a new project',
                icon: 'plus',
                run: 'project.html#/projects/create'
            });

            expect($scope.projectRowModel).toBeDefined();
            expect($scope.projectRowModel.rows).toBeDefined();
            expect($scope.projectRowModel.rows.length).toBe(projects.length);
            expect($scope.projectRowModel.rows[0].data).toBeDefined();
            expect($scope.projectRowModel.rows[0].data.id).toBe(projects[0].id);
            expect($scope.projectRowModel.rows[0].data.name).toBe(projects[0].name);
            expect($scope.projectRowModel.rows[0].data.route).toBe("projects");
            expect($scope.projectRowModel.rows[0].actions).toBeDefined();
            expect($scope.projectRowModel.rows[0].actions.length).toBe(projects[0].applicationIds.length);
            expect($scope.projectRowModel.rows[0].actions[0].name).toBe("JIRA Homepage");
            expect($scope.projectRowModel.rows[0].actions[0].url).toBe(availableApps[0].url + "/browse/" + projects[0].key);
            expect($scope.projectRowModel.rows[0].actions[0].icon).toBe("share");
            expect($scope.projectRowModel.rows[0].actions[0].class).toBe("default");
            expect($scope.projectRowModel.rows[0].actions[0].external).toBe(true);
            expect($scope.projectRowModel.rows[0].actions[1].name).toBe("Confluence Homepage");
            expect($scope.projectRowModel.rows[0].actions[1].url).toBe(availableApps[1].url + "/display/" + projects[0].key);
            expect($scope.projectRowModel.rows[0].actions[1].icon).toBe("share");
            expect($scope.projectRowModel.rows[0].actions[1].class).toBe("default");
            expect($scope.projectRowModel.rows[0].actions[1].external).toBe(true);
        });
    });

    describe('Test CreateController', function() {
        var $scope,
            rootScope,
            controller,
            Restangular,
            httpBackend,
            timeout,
            window,
            authStateService,
            restTableModelService,
            arrayTableModelService;

        var availableApps = [{
            id: 1,
            supportedAppId: 1,
            url: "http://jira.example.com",
            name: "My JIRA",
            type: "JIRA",
            linkConfigured: true
        }, {
            id: 2,
            supportedAppId: 2,
            url: "http://confluence.example.com",
            name: "My Confluence",
            type: "Confluence",
            linkConfigured: true
        }, {
            id: 3,
            supportedAppId: 3,
            url: "http://stash.example.com",
            name: "My Stash",
            type: "Stash",
            linkConfigured: true
        }];

        var supportedApps = [{
            id: 1,
            name: "JIRA"
        }, {
            id: 2,
            name: "Confluence"
        }, {
            id: 3,
            name: "Bitbucket Server"
        }];

        var groups = [{
            id: 1,
            name: "admin-group",
            role: "ROLE_ADMIN",
            external: true,
            deleted: false,
            active: true
        }, {
            id: 2,
            name: "user-group",
            role: "ROLE_USER",
            external: false,
            deleted: false,
            active: true
        }, {
            id: 3,
            name: "test-group",
            role: "ROLE_USER",
            isExternal: true,
            isDeleted: false,
            isActive: true
        }];

        var users = [{
            id: 1,
            name: "admin",
            email: "admin@admin",
            role: "ROLE_ADMIN",
            external: true,
            active: true,
            deleted: false,
            firstName: "Admin",
            lastName: "Admin"
        }, {
            id: 2,
            name: "user",
            email: "user@user",
            role: "ROLE_USER",
            external: false,
            active: true,
            deleted: false,
            firstName: "User",
            lastName: "User"
        }, {
            id: 3,
            name: "test",
            email: "test@test",
            role: "ROLE_USER",
            external: true,
            active: true,
            deleted: false,
            firstName: "Test",
            lastName: "Test"
        }];

        var projectTemplates = [{
            name: "test1",
            description: "description 1",
            projectType: "business",
            projectTemplateWebItemKey: "test1-web-item-key",
            projectTemplateModuleKey: "test1-module-key"
        }, {
            name: "test2",
            description: "description 2",
            projectType: "business",
            projectTemplateWebItemKey: "test2-web-item-key",
            projectTemplateModuleKey: "test2-module-key"
        }];

        var testProject = {
            key: "test",
            name: "Test Project"
        };

        var HTMLElements = {};
        var originalGetElementById;

        beforeEach(inject(function ($rootScope, _Restangular_, _$httpBackend_, $timeout, $controller, _authStateService_, _restTableModelService_, _arrayTableModelService_) {
            rootScope = $rootScope;
            $scope = $rootScope.$new();
            Restangular = _Restangular_;
            httpBackend = _$httpBackend_;
            timeout = $timeout;
            authStateService = _authStateService_;
            restTableModelService = _restTableModelService_;
            arrayTableModelService = _arrayTableModelService_;

            httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/users/user-auth-state").respond(testUtils.getUserAuthState());
            httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/installed-application").respond(availableApps);
            httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/supported-application").respond(supportedApps);
            httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/groups").respond(groups);
            httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/users").respond(users);
            httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/projects/supported-application").respond(supportedApps);
            httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/installed-application/1/status").respond({
                status: "RUNNING"
            });
            httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/installed-application/2/status").respond({
                status: "STOPPED"
            });
            httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/installed-application/3/status").respond({
                status: "RUNNING"
            });
            httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/application/1/jira/project-template").respond(projectTemplates);
            httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/users/group/1").respond([users[0]]);
            httpBackend.whenGET(baseUrl + "/rest-with-cookies/api/v1/users/group/2").respond(users.slice(1));

            originalGetElementById = document.getElementById;
            document.getElementById = jasmine.createSpy("document").and.callFake(function(id) {
                if(!HTMLElements[id]) {
                    var element = document.createElement("div");
                    element.id = id;
                    HTMLElements[id] = element;
                }

                return HTMLElements[id];
            });

            window = jasmine.createSpy("window");

            controller = $controller('CreateController', {
                '$scope': $scope,
                Restangular: Restangular,
                authStateService: authStateService,
                restTableModelService: restTableModelService,
                arrayTableModelService: arrayTableModelService,
                $timeout: $timeout,
                $window: window
            });
        }));

        afterEach(function() {
            document.getElementById = originalGetElementById;
        });

        it('Select one application and go to second step', function () {
            doFirstStep();
        });

        it('Select Bitbucket Server application and go to third step', function () {
            startProjectWizard();

            $scope.apps[2].selected = true;
            $scope.checkApps();

            rootScope.$digest();

            expect($scope.appSubmitted).toBe(true);
            expect($scope.appSettingsSubmitted).toBe(true);
            expect($scope.detailsSubmitted).toBeUndefined();
            expect($scope.error).toBeUndefined();
            expect($scope.selectedAppsIds).toEqual([3]);
        });

        it('Select no application and stay at first step', function () {
            startProjectWizard();

            $scope.checkApps();

            rootScope.$digest();

            expect($scope.appSubmitted).toBe(false);
            expect($scope.error).toBe("Please select an application before continuing");
            expect($scope.selectedAppsIds).toBeUndefined();
        });

        it('Select JIRA project template and go to third step', function () {
            doSecondStep();
        });

        it('Select no project template and stay at second step', function () {
            doFirstStep();

            $scope.checkAppSettings();
            expect($scope.detailsSubmitted).toBe(false);
            expect($scope.privilegesSubmitted).toBe(false);
            expect($scope.error).toBe("Select Project Template for JIRA before continuing");
        });

        it('Type project key and name and go to fourth step', function () {
            doThirdStep();
        });

        it('Type invalid project key or name and stay at third step', function () {
            doSecondStep();

            $scope.key = "test";
            $scope.name = "test name";
            expect($scope.keyValid).toBe(false);
            $scope.submitDetails();

            httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/projects/validate-key").respond({
                keyValid: false
            });

            rootScope.$digest();
            timeout.flush();
            httpBackend.flush();

            expect($scope.keyValid).toBe(false);
            expect($scope.detailsSubmitted).toBe(false);
            expect($scope.privilegesSubmitted).toBe(false);
            expect($scope.error).toBe("Please fill in all details correctly before continuing");
            expect(HTMLElements["project-key-validated"].className).toBe("glyphicon glyphicon-remove-sign");
            expect(HTMLElements["project-key-validated"].style.color).toBe("red");
        });

        it('Select admin group and user group and create project', function () {
            doFourthStep(false, false);
        });

        it('Create new admin group and select user group and create project', function () {
            doFourthStep(true, false);
        });

        it('Create new admin group and create user group and create project', function () {
            doFourthStep(true, true);
        });

        it('Select admin group and create user group and create project', function () {
            doFourthStep(false, true);
        });

        it('Select no admin group and stay at fourth step', function () {
            doThirdStep();

            $scope.userGroupId = groups[1].id;
            $scope.createProject();

            rootScope.$digest();
            timeout.flush();
            httpBackend.flush();

            expect($scope.privilegesSubmitted).toBe(false);
            expect($scope.error).toBe("Please choose an admin group before continuing");
        });

        it('Select no user group and stay at fourth step', function () {
            doThirdStep();

            $scope.adminGroupId = groups[0].id;
            $scope.createProject();

            rootScope.$digest();
            timeout.flush();
            httpBackend.flush();

            expect($scope.privilegesSubmitted).toBe(false);
            expect($scope.error).toBe("Please choose a user group before continuing");
        });

        function startProjectWizard() {
            rootScope.$digest();
            httpBackend.flush();
            timeout.flush();

            expect($scope.adminGroupOptions.length).toBe(1);
            expect($scope.adminGroupOptions[0].id).toBe(groups[0].id);
            expect($scope.userGroupOptions.length).toBe(1);
            expect($scope.userGroupOptions[0].id).toBe(groups[0].id);
            expect($scope.adminGroupId).toBe("");
            expect($scope.userGroupId).toBe("");

            expect($scope.appSubmitted).toBe(false);
            expect($scope.appSettingsSubmitted).toBeUndefined();
            expect($scope.detailsSubmitted).toBeUndefined();
            expect($scope.privilegesSubmitted).toBeUndefined();

            expect($scope.apps.length).toBe(availableApps.length);
            expect($scope.projectWizardSupportedApps.length).toBe(availableApps.length);

            expect($scope.allUsers.length).toBe(users.length);
            expect($scope.availableUsers.rows.length).toBe(2);
            expect($scope.availableUsers.rows[0].data.id).toBe(1);
            expect($scope.availableUsers.rows[1].data.id).toBe(3);
            expect($scope.availableAdminUsers.rows.length).toBe(2);
            expect($scope.availableAdminUsers.rows[0].data.id).toBe(1);
            expect($scope.availableAdminUsers.rows[1].data.id).toBe(3);
            expect($scope.selectedUsers.rows.length).toBe(0);
            expect($scope.selectedAdminUsers.rows.length).toBe(0);
        }

        function doFirstStep() {
            startProjectWizard();

            $scope.apps[0].selected = true;
            $scope.checkApps();

            rootScope.$digest();
            httpBackend.flush();

            expect($scope.appSubmitted).toBe(true);
            expect($scope.error).toBeUndefined();
            expect($scope.selectedAppsIds).toEqual([1]);
        }

        function doSecondStep() {
            doFirstStep();

            $scope.apps[0].jiraTemplateModuleKey = projectTemplates[0].projectTemplateModuleKey;
            $scope.checkAppSettings();
            expect($scope.appSettingsSubmitted).toBe(true);
            expect($scope.detailsSubmitted).toBe(false);
            expect($scope.privilegesSubmitted).toBe(false);
            expect($scope.error).toBeUndefined();
        }

        function doThirdStep() {
            doSecondStep();

            $scope.key = testProject.key;
            $scope.name = testProject.name;
            expect($scope.keyValid).toBe(false);
            $scope.submitDetails();

            httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/projects/validate-key").respond({
                keyValid: true
            });

            rootScope.$digest();
            timeout.flush();
            httpBackend.flush();

            expect($scope.keyValid).toBe(true);
            expect($scope.detailsSubmitted).toBe(true);
            expect($scope.privilegesSubmitted).toBe(false);
            expect($scope.error).toBeUndefined();
            expect(HTMLElements["project-key-validated"].className).toBe("glyphicon glyphicon-ok-sign");
            expect(HTMLElements["project-key-validated"].style.color).toBe("green");
        }

        function doFourthStep(createAdminGroup, createUserGroup) {
            doThirdStep();

            if (createAdminGroup) {
                $scope.newAdminGroupNeeded();
            } else {
                $scope.adminGroupId = groups[0].id;
            }

            if (createUserGroup) {
                $scope.newUserGroupNeeded();
            } else {
                $scope.userGroupId = groups[1].id;
            }
            $scope.createProject();

            httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/projects", {
                name: 'Test Project',
                key: 'TP',
                description: 'Spectrum Project',
                projectApplicationDetails: [{
                    id: 1,
                    jiraDetail: {
                        projectTemplateModuleKey: 'test1-module-key',
                        projectTemplateWebItemKey: 'test1-web-item-key'
                    },
                    confluenceDetail: {
                        spaceKey: undefined,
                        createSpace: true,
                        parentPageId: undefined
                    }
                }],
                userGroup: createUserGroup ? [] : ['user', 'test'],
                adminGroup: createAdminGroup ? [] : ['admin']
            }).respond();

            rootScope.$digest();
            timeout.flush();
            httpBackend.flush();

            expect($scope.privilegesSubmitted).toBe(true);
            expect($scope.error).toBeUndefined();

            if (!createAdminGroup) {
                expect($scope.projectAdminUsernames).toEqual(["admin"]);
            }

            if (!createUserGroup) {
                expect($scope.projectuserUsernames).toEqual(["user", "test"]);
            }
            expect(window.location).toBe("project.html#/projects?created=true");
        }
    });
});
