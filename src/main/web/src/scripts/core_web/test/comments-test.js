'use strict';
var baseUrl = "http://www.example.com";
describe('comments', function() {

	beforeEach(module('spectrumCommentsModule'));

    var $compile,
        $rootScope,
        $httpBackend,
        $scope,
        widgetCommentService,
        $timeout,
        widget,
        $sce;

    var appType = "jira",
        appId = 1,
        itemKey = "ISSUE-1";

    // define startsWith for Strings if not present
    if (String.prototype.startsWith === undefined) {
        String.prototype.startsWith = function(string) {
            return this.indexOf(string) > -1;
        }
    }

    var trustedHtmlTester = function(expected) {
        return {
            asymmetricMatch: function(actual) {
                return $sce.valueOf(actual) == expected;
            }
        }
    };

    beforeEach(inject(function(_$compile_, _$rootScope_, _$httpBackend_, _widgetCommentService_, _$timeout_, _$sce_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;
        widgetCommentService = _widgetCommentService_;
        $timeout = _$timeout_;
        widget = { wid: 1 };
        $scope.widget = widget;
        $sce = _$sce_;

        function getDebounceMock ($timeout) {
            return function mockDebounceForAngularJS(fn, ms) {
                var callPromise;
                return function () {
                    $timeout.cancel(callPromise);
                    var args = arguments;
                    callPromise = $timeout(function () {
                        fn.apply(this, args);
                    }, ms);
                };
            };
        };

        spyOn(_, 'debounce').and.callFake(getDebounceMock($timeout));

        $httpBackend.whenGET('partials/spectrum-comments.html').respond("<div id='comments-modal-"+ widget.wid + "' class='modal fade comment-modal' role='dialog'>" +
            "<textarea rows='3' ng-model='comments.newComment' ng-keyup='checkMentions($event)' ng-keydown='processKeypress($event)'></textarea></div>");

    }));

	var compileCommentsDialog = function(scope) {
        var element = $compile("<spectrum-comments widget='widget' comments='comments'></spectrum-comments>")(scope);
        $httpBackend.flush();
        $scope.$digest();
        return element;
    }

    var initPermissions = function(hasAddCommentsPermission, hasBrowsePermission) {
        $httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: appType,
            method: "canUserAddComments",
            appId: appId,
            payload: {
                issueKey: itemKey
            }
        }).respond({
            payload: JSON.stringify({
                addComments: {
                    havePermission: hasAddCommentsPermission
                },
                browseUsers: {
                    havePermission: hasBrowsePermission
                }
            })
        });
    }

    var initComments = function(comments) {
        var comments = comments !== undefined && comments || [];

        $httpBackend.whenPOST(baseUrl + '/rest-with-cookies/api/v1/message', {
            type: appType,
            method: "getComments",
            appId:appId,
            payload: {
                issueKey: itemKey
            }
        }).respond({
            payload: JSON.stringify({
                comments: comments
            })
        });
    }

    it('Tests comments loading', function() {
        var comment = {
            renderedBody: "<p>test body</p>",
            author: {
                avatarUrls: {
                    "16x16": "http://www.example.com"
                },
                displayName: "admin"
            },
            created: new Date().getTime()
        };

        initPermissions(true, false);
        initComments([comment]);

		var commentsDialog = compileCommentsDialog($scope);
        var directiveScope = commentsDialog.isolateScope();

		$scope.comments = widgetCommentService.getCommentsModel(appId, itemKey, appType);
        $scope.comments.issueTitle = "ISSUE TITLE";
        $scope.comments.issueKey = "TEST-1";
        widgetCommentService.showModal($scope.comments, widget);
		$scope.$digest();

		expect(directiveScope.comments.ready).toBe(false);
		expect(directiveScope.comments.allComments).not.toBeUndefined();
        expect(directiveScope.comments.allComments.length).toBe(0);
		expect(directiveScope.comments.issueTitle).toBe("ISSUE TITLE");
		expect(directiveScope.comments.issueKey).toBe("TEST-1");

		$httpBackend.flush();

		expect(directiveScope.comments.ready).toBe(true);
		expect(directiveScope.comments.allComments).not.toBeUndefined();
		expect(directiveScope.comments.allComments.length).toBe(1);
		expect(directiveScope.comments.allComments[0]).toEqual({
           body: trustedHtmlTester(comment.renderedBody),
           creator: {
               avatar: comment.author.avatarUrls["16x16"],
               name: comment.author.displayName
           },
           created: moment(comment.created).fromNow()
       });
    });

    it('Tests a new comment post', function() {
		var testComment = "Test Comment";

		initPermissions(true, true);

		var getCommentsRespondHandler = $httpBackend.whenPOST(baseUrl + '/rest-with-cookies/api/v1/message', {
			type: appType,
			method: "getComments",
			appId:appId,
			payload: {
				issueKey: itemKey
			}
		});

		getCommentsRespondHandler.respond({
			payload: JSON.stringify({
		        comments: []
		    })
		});

        var comment = {
            renderedBody: "<p>First Comment</p>",
            author: {
                avatarUrls: {
                    "16x16": "http://www.example.com"
                },
                displayName: "admin"
            },
            created: new Date().getTime()
        };

		var commentsDialog = compileCommentsDialog($scope);
        var directiveScope = commentsDialog.isolateScope();

		$scope.comments = widgetCommentService.getCommentsModel(appId, itemKey, appType);
		$httpBackend.flush();

        $httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: appType,
            method: "addComment",
            appId: appId,
            payload: {
                issueKey: itemKey,
                comment: testComment
            }
        }).respond({
            payload: JSON.stringify(comment)
        });

        getCommentsRespondHandler.respond({
            payload: JSON.stringify({
                comments: [comment]
            })
        });
		directiveScope.comments.newComment = testComment;

        directiveScope.addNewComment(directiveScope.comments);
        expect(directiveScope.comments.newComment).toBe(testComment);
        expect(directiveScope.comments.submitting).toBeTruthy();
        $httpBackend.flush();
        expect(directiveScope.comments.newComment).toBeUndefined();
        expect(directiveScope.comments.submitting).toBeFalsy();
        expect(directiveScope.comments.allComments).not.toBeUndefined();
        expect(directiveScope.comments.allComments.length).toBe(1);
        expect(directiveScope.comments.allComments[0]).toEqual({
           body: trustedHtmlTester(comment.renderedBody),
           creator: {
               avatar: comment.author.avatarUrls["16x16"],
               name: comment.author.displayName
           },
           created: moment(comment.created).fromNow()
       });

       $httpBackend.verifyNoOutstandingExpectation();
       $httpBackend.verifyNoOutstandingRequest();
    });

    it('Tests a new comment post without add comment permission', function() {
        var testComment = "Test Comment";

        initPermissions(false, true);
        initComments();

        var commentsDialog = compileCommentsDialog($scope);
        var directiveScope = commentsDialog.isolateScope();

        $scope.comments = widgetCommentService.getCommentsModel(appId, itemKey, appType);
        $httpBackend.flush();

        // this cannot be done through ui as textarea is hidden, but we can check if the method is called manually
        directiveScope.comments.newComment = testComment;

        directiveScope.addNewComment(directiveScope.comments);
        expect(directiveScope.comments.newComment).toBe(testComment);
    });

    it('Tests a new comment post with error', function() {
        var testComment = "Test Comment";

        initPermissions(true, true);
        initComments();

        var commentsDialog = compileCommentsDialog($scope);
        var directiveScope = commentsDialog.isolateScope();

        $scope.comments = widgetCommentService.getCommentsModel(appId, itemKey, appType);
        $httpBackend.flush();

        $httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: appType,
            method: "addComment",
            appId: appId,
            payload: {
                issueKey: itemKey,
                comment: testComment
            }
        }).respond(403);

        directiveScope.comments.newComment = testComment;

        directiveScope.addNewComment(directiveScope.comments);
        $httpBackend.flush();
        expect(directiveScope.comments.newComment).toBe(testComment);
        expect(directiveScope.comments.error).toBe("Comment could not be added.");

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('Tests mentions', function() {
        var searchString = "ad"

        initPermissions(true, true);
        initComments();

        var user = {
            "key":"admin",
            "name":"admin",
            "emailAddress":"admin@example.com",
            "avatarUrls": {
                "16x16":"http://localhost:2990/jira/secure/useravatar?size=xsmall&avatarId=10340",
                "24x24":"http://localhost:2990/jira/secure/useravatar?size=small&avatarId=10340",
                "32x32":"http://localhost:2990/jira/secure/useravatar?size=medium&avatarId=10340",
                "48x48":"http://localhost:2990/jira/secure/useravatar?avatarId=10340"
            },
            "displayName":"admin",
            "active":true,
            "timeZone":"Europe/Bratislava",
            "locale":"en_US"
        }

        var commentsDialog = compileCommentsDialog($scope);
        var directiveScope = commentsDialog.isolateScope();

        $scope.comments = widgetCommentService.getCommentsModel(appId, itemKey, appType);
        $httpBackend.flush();

        $httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "jira",
            method: "findUsersWithBrowsePermissions",
            appId: appId,
            payload: {
                username: searchString,
                issueKey: itemKey
            }
        }).respond({
            payload: JSON.stringify([user])
        });

        var textArea = commentsDialog.find("textarea");
        // testing @ mention
        textArea.val("@" + searchString);
        textArea.selectionStart = 3;
        textArea.trigger("change");
        var event = $.Event( "keyup", { keyCode: 64, target: textArea } );
        textArea.trigger(event);

        // flushing debounce
        $timeout.flush();

        expect(directiveScope.comments.foundUsers).toBeUndefined();
        expect(directiveScope.comments.mentionControl.controlString).toBe(searchString);
        $httpBackend.flush();
        expect(directiveScope.comments.foundUsers).toBeDefined();
        expect(directiveScope.comments.foundUsers.length).toBe(1);
        expect(directiveScope.comments.foundUsers[0]).toEqual(_.merge(user, {
            renderedBody : '<strong>ad</strong>min - <strong>ad</strong>min@example.com (<strong>ad</strong>min)'
        }));
        expect(directiveScope.comments.selectedUser.key).toBe("admin");
        expect(directiveScope.comments.mentionControl.controlString).toBe(searchString);

        event = $.Event( "keydown", { keyCode: 13, target: textArea } );
        textArea.trigger(event);
        expect(textArea.val()).toBe("[~admin]");
        expect(directiveScope.comments.newComment).toBe("[~admin]");

        $httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "jira",
            method: "findUsersWithBrowsePermissions",
            appId: appId,
            payload: {
                username: searchString,
                issueKey: itemKey
            }
        }).respond({
            payload: JSON.stringify([user])
        });

        // [~ mention
        textArea.val("1234567890\n12345 [~" + searchString + " 1234567890");
        textArea.selectionStart = 21;
        textArea.trigger("change");
        var event = $.Event( "keyup", { keyCode: 64, target: textArea } );
        textArea.trigger(event);

        // flushing debounce
        $timeout.flush();

        expect(directiveScope.comments.mentionControl.controlString).toBe(searchString);
        $httpBackend.flush();
        expect(directiveScope.comments.foundUsers).toBeDefined();
        expect(directiveScope.comments.foundUsers.length).toBe(1);
        expect(directiveScope.comments.foundUsers[0]).toEqual(_.merge(user, {
            renderedBody : '<strong>ad</strong>min - <strong>ad</strong>min@example.com (<strong>ad</strong>min)'
        }));
        expect(directiveScope.comments.mentionControl.controlString).toBe(searchString);

        event = $.Event( "keydown", { keyCode: 13, target: textArea } );
        textArea.trigger(event);
        var result = "1234567890\n12345 [~admin] 1234567890"
        expect(textArea.val()).toBe(result);
        expect(directiveScope.comments.newComment).toBe(result);

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('Tests mentions when no users are found', function() {
        var searchString = "ad"

        initPermissions(true, true);
        initComments();

        var commentsDialog = compileCommentsDialog($scope);
        var directiveScope = commentsDialog.isolateScope();

        $scope.comments = widgetCommentService.getCommentsModel(appId, itemKey, appType);
        $httpBackend.flush();

        $httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "jira",
            method: "findUsersWithBrowsePermissions",
            appId: appId,
            payload: {
                username: searchString,
                issueKey: itemKey
            }
        }).respond({
            payload: "[]"
        });

        var textArea = commentsDialog.find("textarea");
        textArea.val("@" + searchString);
        textArea.selectionStart = 3;
        textArea.trigger("change");
        var event = $.Event( "keyup", { keyCode: 64, target: textArea } );
        textArea.trigger(event);

        // flushing debounce
        $timeout.flush();

        expect(directiveScope.comments.foundUsers).toBeUndefined();
        expect(directiveScope.comments.mentionControl.controlString).toBe(searchString);
        $httpBackend.flush();
        expect(directiveScope.comments.foundUsers).toBeDefined();
        expect(directiveScope.comments.foundUsers.length).toBe(0);
        expect(directiveScope.comments.mentionControl.controlString).toBe(searchString);

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('Tests mentions with no browse users permissions', function() {
        var searchString = "ad"

        initPermissions(true, false);
        initComments();

        var commentsDialog = compileCommentsDialog($scope);
        var directiveScope = commentsDialog.isolateScope();

        $scope.comments = widgetCommentService.getCommentsModel(appId, itemKey, appType);
        $httpBackend.flush();

        var textArea = commentsDialog.find("textarea");
        textArea.val("@" + searchString);
        textArea.selectionStart = 3;
        textArea.trigger("change");
        var event = $.Event( "keyup", { keyCode: 64, target: textArea } );
        textArea.trigger(event);

        // flushing debounce
        $timeout.flush();

        expect(directiveScope.comments.foundUsers).toBeUndefined();
        expect(directiveScope.comments.mentionControl).toBeUndefined();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('Tests mentions with no mentions', function() {
        var searchString = "ad"

        initPermissions(true, true);
        initComments();

        var commentsDialog = compileCommentsDialog($scope);
        var directiveScope = commentsDialog.isolateScope();

        $scope.comments = widgetCommentService.getCommentsModel(appId, itemKey, appType);
        $httpBackend.flush();

        var textArea = commentsDialog.find("textarea");
        textArea.val("no mentions at all");
        textArea.selectionStart = 5;
        textArea.trigger("change");
        var event = $.Event( "keyup", { keyCode: 64, target: textArea } );
        textArea.trigger(event);

        // flushing debounce
        $timeout.flush();

        expect(directiveScope.comments.foundUsers).toBeUndefined();
        expect(directiveScope.comments.mentionControl).toBeUndefined();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('Tests mentions after closed mentions', function() {
        var searchString = "ad"

        initPermissions(true, true);
        initComments();

        var commentsDialog = compileCommentsDialog($scope);
        var directiveScope = commentsDialog.isolateScope();

        $scope.comments = widgetCommentService.getCommentsModel(appId, itemKey, appType);
        $httpBackend.flush();

        var textArea = commentsDialog.find("textarea");
        textArea.val("12345 [~admin] admin");
        textArea.selectionStart = 20;
        textArea.trigger("change");
        var event = $.Event( "keyup", { keyCode: 64, target: textArea } );
        textArea.trigger(event);

        // flushing debounce
        $timeout.flush();

        expect(directiveScope.comments.foundUsers).toBeUndefined();
        expect(directiveScope.comments.mentionControl).toBeUndefined();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('Tests mentions user list navigation', function() {
        var searchString = "user"

        initPermissions(true, true);
        initComments();

        var users = [];
        [1, 2, 3].forEach(function(index) {
            users.push({
               "key":"user" + index,
               "name":"user" + index,
               "emailAddress":"user" + index + "@example.com",
               "avatarUrls": {
                   "16x16":"http://localhost:2990/jira/secure/useravatar?size=xsmall&avatarId=10340",
                   "24x24":"http://localhost:2990/jira/secure/useravatar?size=small&avatarId=10340",
                   "32x32":"http://localhost:2990/jira/secure/useravatar?size=medium&avatarId=10340",
                   "48x48":"http://localhost:2990/jira/secure/useravatar?avatarId=10340"
               },
               "displayName":"user" + index,
               "active":true,
               "timeZone":"Europe/Bratislava",
               "locale":"en_US"
           });
        });

        var commentsDialog = compileCommentsDialog($scope);
        var directiveScope = commentsDialog.isolateScope();

        $scope.comments = widgetCommentService.getCommentsModel(appId, itemKey, appType);
        $httpBackend.flush();

        $httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "jira",
            method: "findUsersWithBrowsePermissions",
            appId: appId,
            payload: {
                username: searchString,
                issueKey: itemKey
            }
        }).respond({
            payload: JSON.stringify(users)
        });

        var textArea = commentsDialog.find("textarea");
        // testing @ mention
        textArea.val("@" + searchString);
        textArea.selectionStart = searchString.length + 1;
        textArea.trigger("change");
        var event = $.Event( "keyup", { keyCode: 64, target: textArea } );
        textArea.trigger(event);

        // flushing debounce
        $timeout.flush();

        expect(directiveScope.comments.foundUsers).toBeUndefined();
        expect(directiveScope.comments.mentionControl.controlString).toBe(searchString);
        $httpBackend.flush();
        expect(directiveScope.comments.foundUsers).toBeDefined();
        expect(directiveScope.comments.foundUsers.length).toBe(3);

        expect(directiveScope.comments.selectedUser.key).toBe("user1");
        expect(directiveScope.comments.mentionControl.controlString).toBe(searchString);

        event = $.Event( "keydown", { keyCode: 40, target: textArea } );
        textArea.trigger(event);
        expect(directiveScope.comments.selectedUser.key).toBe("user2");

        event = $.Event( "keydown", { keyCode: 40, target: textArea } );
        textArea.trigger(event);
        expect(directiveScope.comments.selectedUser.key).toBe("user3");

        event = $.Event( "keydown", { keyCode: 40, target: textArea } );
        textArea.trigger(event);
        expect(directiveScope.comments.selectedUser.key).toBe("user1");

        event = $.Event( "keydown", { keyCode: 38, target: textArea } );
        textArea.trigger(event);
        expect(directiveScope.comments.selectedUser.key).toBe("user3");

        event = $.Event( "keydown", { keyCode: 38, target: textArea } );
        textArea.trigger(event);
        expect(directiveScope.comments.selectedUser.key).toBe("user2");

        event = $.Event( "keydown", { keyCode: 13, target: textArea } );
        textArea.trigger(event);
        expect(textArea.val()).toBe("[~user2]");
        expect(directiveScope.comments.newComment).toBe("[~user2]");

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('Tests mentions user list select by clicking', function() {
        var searchString = "user"

        initPermissions(true, true);
        initComments();

        var users = [];
        [1, 2, 3].forEach(function(index) {
            users.push({
               "key":"user" + index,
               "name":"user" + index,
               "emailAddress":"user" + index + "@example.com",
               "avatarUrls": {
                   "16x16":"http://localhost:2990/jira/secure/useravatar?size=xsmall&avatarId=10340",
                   "24x24":"http://localhost:2990/jira/secure/useravatar?size=small&avatarId=10340",
                   "32x32":"http://localhost:2990/jira/secure/useravatar?size=medium&avatarId=10340",
                   "48x48":"http://localhost:2990/jira/secure/useravatar?avatarId=10340"
               },
               "displayName":"user" + index,
               "active":true,
               "timeZone":"Europe/Bratislava",
               "locale":"en_US"
           });
        });

        var commentsDialog = compileCommentsDialog($scope);
        var directiveScope = commentsDialog.isolateScope();

        $scope.comments = widgetCommentService.getCommentsModel(appId, itemKey, appType);
        $httpBackend.flush();

        $httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "jira",
            method: "findUsersWithBrowsePermissions",
            appId: appId,
            payload: {
                username: searchString,
                issueKey: itemKey
            }
        }).respond({
            payload: JSON.stringify(users)
        });

        var textArea = commentsDialog.find("textarea");
        // testing @ mention
        textArea.val("@" + searchString);
        textArea.selectionStart = searchString.length + 1;
        textArea.trigger("change");
        var event = $.Event( "keyup", { keyCode: 64, target: textArea } );
        textArea.trigger(event);

        // flushing debounce
        $timeout.flush();

        expect(directiveScope.comments.foundUsers).toBeUndefined();
        expect(directiveScope.comments.mentionControl.controlString).toBe(searchString);
        $httpBackend.flush();
        expect(directiveScope.comments.foundUsers).toBeDefined();
        expect(directiveScope.comments.foundUsers.length).toBe(3);

        expect(directiveScope.comments.selectedUser.key).toBe("user1");
        var firstUser = directiveScope.comments.selectedUser;

        expect(directiveScope.comments.mentionControl.controlString).toBe(searchString);

        event = $.Event( "keydown", { keyCode: 40, target: textArea } );
        textArea.trigger(event);
        expect(directiveScope.comments.selectedUser.key).toBe("user2");

        directiveScope.selectUser(firstUser);
        $timeout.flush();
        expect(textArea.val()).toBe("[~user1]");
        expect(directiveScope.comments.newComment).toBe("[~user1]");
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('Tests mentions with no mentions', function() {
        var searchString = "ad"

        initPermissions(true, true);
        initComments();

        var commentsDialog = compileCommentsDialog($scope);
        var directiveScope = commentsDialog.isolateScope();

        $scope.comments = widgetCommentService.getCommentsModel(appId, itemKey, appType);
        $httpBackend.flush();

        $httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "jira",
            method: "findUsersWithBrowsePermissions",
            appId: appId,
            payload: {
                username: searchString,
                issueKey: itemKey
            }
        }).respond(403);

        var textArea = commentsDialog.find("textarea");
        textArea.val("@" + searchString);
        textArea.selectionStart = 5;
        textArea.trigger("change");
        var event = $.Event( "keyup", { keyCode: 64, target: textArea } );
        textArea.trigger(event);

        // flushing debounce
        $timeout.flush();

        expect(directiveScope.comments.foundUsers).toBeUndefined();
        expect(directiveScope.comments.mentionControl).toBeDefined();
        expect(directiveScope.comments.mentionControl.controlString).toBe(searchString);
        $httpBackend.flush();
        expect(directiveScope.comments.error).toBe("Users could not be loaded.");
        expect(directiveScope.comments.foundUsers).toBeUndefined();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("Tests error message cleaning", function() {
        initPermissions(true, true);
        initComments();

        var commentsDialog = compileCommentsDialog($scope);
        var directiveScope = commentsDialog.isolateScope();
        $scope.comments = widgetCommentService.getCommentsModel(appId, itemKey, appType);
        $httpBackend.flush();

        directiveScope.comments.error = "Test error";
        directiveScope.addNewComment(directiveScope.comments);
        expect(directiveScope.comments.error).toBeUndefined();

        directiveScope.comments.error = "Test error";
        directiveScope.checkMentions();
        expect(directiveScope.comments.error).toBeUndefined();

        directiveScope.comments.error = "Test error";
        directiveScope.onFocus();
        expect(directiveScope.comments.error).toBeUndefined();

        directiveScope.comments.error = "Test error";
        directiveScope.onBlur();
        expect(directiveScope.comments.error).toBeUndefined();
    });

    it('Tests mentions are canceled after empty result', function() {
        initPermissions(true, true);
        initComments();

        var commentsDialog = compileCommentsDialog($scope);
        var directiveScope = commentsDialog.isolateScope();

        $scope.comments = widgetCommentService.getCommentsModel(appId, itemKey, appType);
        $httpBackend.flush();

        $httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "jira",
            method: "findUsersWithBrowsePermissions",
            appId: appId,
            payload: {
                username: 'k',
                issueKey: itemKey
            }
        }).respond({
            payload: "[]"
        });

        var textArea = commentsDialog.find("textarea");
        textArea.val("@k");
        textArea.selectionStart = 2;
        textArea.trigger("change");
        var event = $.Event( "keyup", { keyCode: 64, target: textArea } );
        textArea.trigger(event);

        // flushing debounce
        $timeout.flush();

        expect(directiveScope.comments.foundUsers).toBeUndefined();
        expect(directiveScope.comments.mentionControl.controlString).toBe("k");
        $httpBackend.flush();
        expect(directiveScope.comments.foundUsers).toBeDefined();
        expect(directiveScope.comments.foundUsers.length).toBe(0);
        expect(directiveScope.comments.mentionControl.cancelled).toBeFalsy();

        // another mention after empty result
        textArea.val("@kl");
        textArea.selectionStart = 3;
        textArea.trigger("change");
        var event = $.Event( "keyup", { keyCode: 64, target: textArea } );
        textArea.trigger(event);

        // flushing debounce
        $timeout.flush();

        expect(directiveScope.comments.foundUsers).toBeDefined();
        expect(directiveScope.comments.foundUsers.length).toBe(0);
        expect(directiveScope.comments.mentionControl.controlString).toBe("kl");
        expect(directiveScope.comments.mentionControl.cancelled).toBeTruthy();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

});
