'use strict';

var baseUrl = "http://www.example.com";

describe('Test Widget Comment Service', function() {

    var $sce;

    var trustedHtmlTester = function(expected) {
        return {
            asymmetricMatch: function(actual) {
                return $sce.valueOf(actual) == expected;
            }
        }
    };

    beforeEach(module('widgetRestCommentModelModule'));

    beforeEach(inject(function(_$sce_) {
        $sce = _$sce_;
    }));

    it('Validates configuration', inject(function(Restangular) {
        expect(Restangular.configuration.baseUrl).toBe(baseUrl + "/rest-with-cookies/api/v1");
        expect(Restangular.configuration.defaultHeaders["Content-Type"]).toBe("application/json");
    }));

    it('Validates getUsers', inject(function($httpBackend, widgetCommentService) {
        var appId = 1,
            itemKey = "ISSUE-1",
            searchString = "admin";

        $httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "jira",
            method: "findUsersWithBrowsePermissions",
            appId: appId,
            payload: {
                username: searchString,
                issueKey: itemKey
            }
        }).respond([]);

        widgetCommentService.getUsers(appId, itemKey, searchString);

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    }));

    it('Validates postComment', inject(function($httpBackend, widgetCommentService) {
        var appType = "jira",
            appId = 1,
            itemKey = "ISSUE-1",
            newComment = "comment";

        $httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: appType,
            method: "addComment",
            appId: appId,
            payload: {
                issueKey: itemKey,
                comment: newComment
            }
        }).respond([]);

        widgetCommentService.postComment(appId, itemKey, newComment, appType);

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    }));

    it('Validates decorateComment', inject(function(widgetCommentService) {
        var appUrl = "http://localhost:9876/jira";
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

        var decoratedComment = widgetCommentService.decorateComment(appUrl, comment);
        expect(decoratedComment).toEqual({
            body: trustedHtmlTester(comment.renderedBody),
            creator: {
                avatar: comment.author.avatarUrls["16x16"],
                name: comment.author.displayName
            },
            created: moment(comment.created).fromNow()
        });
    }));

    it('Validates decorateComment with mentions', inject(function(widgetCommentService) {
        var appUrl = "http://localhost:9876/jira";
        var comment = {
            renderedBody: "<p>test body <a class=\"user-hover\" href=\"http://example.com/user\"></a> </p>",
            author: {
                avatarUrls: {
                    "16x16": "http://www.example.com"
                },
                displayName: "admin"
            },
            created: new Date().getTime()
        };

        var decoratedComment = widgetCommentService.decorateComment(appUrl, comment);
        expect(decoratedComment).toEqual({
            body: trustedHtmlTester("<p>test body <a class=\"user-hover\" href=\"http://example.com/user\" target=\"_blank\"></a> </p>"),
            creator: {
                avatar: comment.author.avatarUrls["16x16"],
                name: comment.author.displayName
            },
            created: moment(comment.created).fromNow()
        });
    }));

    it('Validates decorateComment with external links', inject(function(widgetCommentService) {
        var appUrl = "http://localhost:9876/jira";
        var comment = {
            renderedBody: "<p>test body <a class=\"external-link\" href=\"http://example.com\"></a> </p>",
            author: {
                avatarUrls: {
                    "16x16": "http://www.example.com"
                },
                displayName: "admin"
            },
            created: new Date().getTime()
        };

        var decoratedComment = widgetCommentService.decorateComment(appUrl, comment);
        expect(decoratedComment).toEqual({
            body: trustedHtmlTester("<p>test body <a class=\"external-link\" href=\"http://example.com\" target=\"_blank\"></a> </p>"),
            creator: {
                avatar: comment.author.avatarUrls["16x16"],
                name: comment.author.displayName
            },
            created: moment(comment.created).fromNow()
        });
    }));

    it('Validates decorateComment with issue links', inject(function(widgetCommentService) {
        var appUrl = "http://localhost:9876/jira";
        var comment = {
            renderedBody: "<p>test body <a class=\"issue-link\" href=\"http://example.com/browse/issue/TST-1\"></a> </p>",
            author: {
                avatarUrls: {
                    "16x16": "http://www.example.com"
                },
                displayName: "admin"
            },
            created: new Date().getTime()
        };

        var decoratedComment = widgetCommentService.decorateComment(appUrl, comment);
        expect(decoratedComment).toEqual({
            body: trustedHtmlTester("<p>test body <a class=\"issue-link\" href=\"http://example.com/browse/issue/TST-1\" target=\"_blank\"></a> </p>"),
            creator: {
                avatar: comment.author.avatarUrls["16x16"],
                name: comment.author.displayName
            },
            created: moment(comment.created).fromNow()
        });
    }));

    it('Validates decorateComment with relative emoticons', inject(function(widgetCommentService) {
        var appUrl = "http://localhost:9876/jira";
        var comment = {
            renderedBody: "<p>test body <img class=\"emoticon\" src=\"/smile.png\"> </p>",
            author: {
                avatarUrls: {
                    "16x16": "http://www.example.com"
                },
                displayName: "admin"
            },
            created: new Date().getTime()
        };

        var decoratedComment = widgetCommentService.decorateComment(appUrl, comment);
        expect(decoratedComment).toEqual({
            body: trustedHtmlTester("<p>test body <img class=\"emoticon\" src=\"http://localhost:9876/smile.png\"> </p>"),
            creator: {
                avatar: comment.author.avatarUrls["16x16"],
                name: comment.author.displayName
            },
            created: moment(comment.created).fromNow()
        });
    }));

    it('Validates decorateComment with plain text body', inject(function(widgetCommentService) {
        var appUrl = "http://localhost:9876/jira";
        var comment = {
            renderedBody: "Plain Text",
            author: {
                avatarUrls: {
                    "16x16": "http://www.example.com"
                },
                displayName: "admin"
            },
            created: new Date().getTime()
        };

        var decoratedComment = widgetCommentService.decorateComment(appUrl, comment);
        expect(decoratedComment).toEqual({
            body: trustedHtmlTester("Plain Text"),
            creator: {
                avatar: comment.author.avatarUrls["16x16"],
                name: comment.author.displayName
            },
            created: moment(comment.created).fromNow()
        });
    }));

    it('Validates decorateComment with empty body', inject(function(widgetCommentService) {
        var appUrl = "http://localhost:9876/jira";
        var comment = {
            renderedBody: "",
            author: {
                avatarUrls: {
                    "16x16": "http://www.example.com"
                },
                displayName: "admin"
            },
            created: new Date().getTime()
        };

        var decoratedComment = widgetCommentService.decorateComment(appUrl, comment);
        expect(decoratedComment).toEqual({
            body: "",
            creator: {
                avatar: comment.author.avatarUrls["16x16"],
                name: comment.author.displayName
            },
            created: moment(comment.created).fromNow()
        });
    }));

    it('Validates decorateComment with undefined body', inject(function(widgetCommentService) {
        var appUrl = "http://localhost:9876/jira";
        var comment = {
            author: {
                avatarUrls: {
                    "16x16": "http://www.example.com"
                },
                displayName: "admin"
            },
            created: new Date().getTime()
        };

        var decoratedComment = widgetCommentService.decorateComment(appUrl, comment);
        expect(decoratedComment).toEqual({
            body: "",
            creator: {
                avatar: comment.author.avatarUrls["16x16"],
                name: comment.author.displayName
            },
            created: moment(comment.created).fromNow()
        });
    }));

    it('Validates getCommentsModel', inject(function($rootScope, $httpBackend, widgetCommentService) {
        var appType = "jira",
            appId = 1,
            itemKey = "ISSUE-1";

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
                    havePermission: true
                },
                browseUsers: {
                    havePermission: false
                }
            })
        });

        $httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: appType,
            method: "getComments",
            appId:appId,
            payload: {
                issueKey: itemKey
            }
        }).respond({
            payload: JSON.stringify({
                comments: [comment]
            })
        });

        var comments = widgetCommentService.getCommentsModel(appId, itemKey, appType);

        expect(comments.appId).toBe(appId);
        expect(comments.appType).toBe(appType);
        expect(comments.ItemKey).toBe(itemKey);
        expect(comments.ready).toBe(false);
        expect(comments.promise).toBeDefined();

        comments.promise.then(function(data) {
        });

        $rootScope.$digest();
        $rootScope.$apply();
        $httpBackend.flush();

        expect(comments.allComments.length).toBe(1);
        expect(comments.allComments[0]).toEqual({
            body: trustedHtmlTester(comment.renderedBody),
            creator: {
                avatar: comment.author.avatarUrls["16x16"],
                name: comment.author.displayName
            },
            created: moment(comment.created).fromNow()
        });
        expect(comments.haveAddPermission).toBe(true);
        expect(comments.haveBrowseUserPermission).toBe(false);
        expect(comments.ready).toBe(true);
    }));
});
