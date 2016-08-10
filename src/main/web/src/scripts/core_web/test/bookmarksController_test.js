describe('Test Bookmarks Controller', function() {

    beforeEach(module('personalisedDashboardModule'));

    var $scope,
        rootScope,
        controller,
        Restangular,
        httpBackend,
        angularSpy,
        arrayTableModelService,
        listApplicationMock,
        dashboardProvider;

    var HTMLElements = {},
        originalGetElementById;

    beforeEach(inject(function ($rootScope, _Restangular_, _$httpBackend_, $controller, _dashboard_, _arrayTableModelService_) {
        rootScope = $rootScope;
        $scope = $rootScope.$new();
        Restangular = _Restangular_;
        httpBackend = _$httpBackend_;
        dashboardProvider = _dashboard_;
        arrayTableModelService = _arrayTableModelService_;

        httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/application/supported-application').respond(testUtils.getSupportedApps());
        httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/application/installed-application').respond(testUtils.getAvailableApps());
        httpBackend.whenGET(baseUrl + '/rest-with-cookies/api/v1/users/user-auth-state').respond(testUtils.getUserAuthState());

        angularSpy = spyOn(angular, 'element').and.returnValue(testUtils.getPersonalisedDashboardModel([testUtils.getConfluenceWidget()]));
        listApplicationMock = jasmine.createSpy('listApplication');

        spyOn($scope, '$on').and.callFake(function(name, callback){
            expect(name).toBe('listApplicationLinksChanged')
        });

        $scope.$parent.$parent = { editMode: false };

        originalGetElementById = document.getElementById;
        document.getElementById = jasmine.createSpy("document").and.callFake(function(id) {
            if(!HTMLElements[id]) {
                var element = document.createElement("div");
                element.id = id;
                HTMLElements[id] = element;
            }

            return HTMLElements[id];
        });

        this.init = function(moreConfig){
            var widget = { wid: 2, config: {} };
            for(var prop in moreConfig){
                widget.config[prop] = moreConfig[prop];
            }
            $scope.config = widget.config;

            controller = $controller('bookmarksController', {
                '$scope': $scope,
                'widget': widget,
                'arrayTableModelService': arrayTableModelService,
                'Restangular': Restangular
            });
        }
    }));

    afterEach(function() {
        document.getElementById = originalGetElementById;
        angularSpy.and.callThrough();
    });

    it('Add bookmark', inject(function($timeout) {
        var bookmark = {
            id: 1,
            link: "http://www.google.com",
            label: "Google"
        };

        var newBookmark = {
            link: "http://www.google.com",
            label: "Example"
        };

        this.init();
        httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "bookmarks",
            method: "getBookmarks",
            appId: null
        }).respond({
            payload: JSON.stringify([bookmark])
        });

        $scope.$digest();
        httpBackend.flush();
        $timeout.flush();

        expect($scope.bookmarkToSave.length).toEqual(0);
        expect($scope.bookmarkToDelete.length).toEqual(0);
        expect($scope.data.bookmarkLinkError).toBeUndefined();
        expect($scope.data.formErrors).toBeUndefined();
        expect($scope.resultTable.rows.length).toEqual(1);
        expect($scope.resultTable.rows[0].data.id).toEqual(bookmark.id);
        expect($scope.resultTable.rows[0].data.link).toEqual(bookmark.link);
        expect($scope.resultTable.rows[0].data.label).toEqual(bookmark.label);

        $scope.data.bookmark = jQuery.extend({}, newBookmark);
        $scope.addBookmark({ $valid: true });
        $scope.$digest();

        expect($scope.data.bookmarkLinkError).toEqual(false);
        expect($scope.data.formErrors).toEqual(false);
        expect($scope.bookmarkToSave.length).toEqual(1);
        expect($scope.bookmarkToSave[0].link).toEqual(newBookmark.link);
        expect($scope.bookmarkToSave[0].label).toEqual(newBookmark.label);
        expect($scope.bookmarkToDelete.length).toEqual(0);
        expect($scope.data.bookmark.link).toEqual("");
        expect($scope.data.bookmark.label).toEqual("");
        expect($scope.resultTable.rows.length).toEqual(2);
        expect($scope.resultTable.rows[1].data.link).toEqual(newBookmark.link);
        expect($scope.resultTable.rows[1].data.label).toEqual(newBookmark.label);

        httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "bookmarks",
            method: "addBookmark",
            appId: null,
            payload: {
                link: newBookmark.link,
                label: newBookmark.label
            }
        }).respond();

        $scope.updateBookmarks();
        $scope.$digest();
        $timeout.flush();
        httpBackend.flush();
    }));

    it('Cannot add bookmark with empty label', inject(function($timeout) {
        var bookmark = {
            id: 1,
            link: "http://www.google.com",
            label: "Google"
        };

        var newBookmark = {
            link: "http://www.example.com",
            label: ""
        };

        this.init();
        httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "bookmarks",
            method: "getBookmarks",
            appId: null
        }).respond({
            payload: JSON.stringify([bookmark])
        });

        $scope.$digest();
        httpBackend.flush();
        $timeout.flush();

        expect($scope.bookmarkToSave.length).toEqual(0);
        expect($scope.bookmarkToDelete.length).toEqual(0);
        expect($scope.data.bookmarkLinkError).toBeUndefined();
        expect($scope.data.formErrors).toBeUndefined();
        expect($scope.resultTable.rows.length).toEqual(1);
        expect($scope.resultTable.rows[0].data.id).toEqual(bookmark.id);
        expect($scope.resultTable.rows[0].data.link).toEqual(bookmark.link);
        expect($scope.resultTable.rows[0].data.label).toEqual(bookmark.label);

        $scope.data.bookmark = jQuery.extend({}, newBookmark);
        $scope.addBookmark({ $valid: true });
        $scope.$digest();

        expect($scope.data.bookmarkLinkError).toEqual(false);
        expect($scope.data.formErrors).toEqual("Enter Valid Label");
        expect($scope.bookmarkToSave.length).toEqual(0);
        expect($scope.bookmarkToDelete.length).toEqual(0);
        expect($scope.data.bookmark.link).toEqual(newBookmark.link);
        expect($scope.data.bookmark.label).toEqual(newBookmark.label);
        expect($scope.resultTable.rows.length).toEqual(1);

        $scope.updateBookmarks();
        $scope.$digest();
    }));

    it('Cannot add bookmark with invalid link', inject(function($timeout) {
        var bookmark = {
            id: 1,
            link: "http://www.google.com",
            label: "Google"
        };

        var newBookmark = {
            link: "htp://ww.example",
            label: "Example"
        };

        this.init();
        httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "bookmarks",
            method: "getBookmarks",
            appId: null
        }).respond({
            payload: JSON.stringify([bookmark])
        });

        $scope.$digest();
        httpBackend.flush();
        $timeout.flush();

        expect($scope.bookmarkToSave.length).toEqual(0);
        expect($scope.bookmarkToDelete.length).toEqual(0);
        expect($scope.data.bookmarkLinkError).toBeUndefined();
        expect($scope.data.formErrors).toBeUndefined();
        expect($scope.resultTable.rows.length).toEqual(1);
        expect($scope.resultTable.rows[0].data.id).toEqual(bookmark.id);
        expect($scope.resultTable.rows[0].data.link).toEqual(bookmark.link);
        expect($scope.resultTable.rows[0].data.label).toEqual(bookmark.label);

        $scope.data.bookmark = jQuery.extend({}, newBookmark);
        $scope.addBookmark({ $valid: true });
        $scope.$digest();

        expect($scope.data.bookmarkLinkError).toEqual(true);
        expect($scope.data.formErrors).toEqual(false);
        expect($scope.bookmarkToSave.length).toEqual(0);
        expect($scope.bookmarkToDelete.length).toEqual(0);
        expect($scope.data.bookmark.link).toEqual(newBookmark.link);
        expect($scope.data.bookmark.label).toEqual(newBookmark.label);
        expect($scope.resultTable.rows.length).toEqual(1);

        $scope.updateBookmarks();
        $scope.$digest();
    }));

    it('Remove bookmark', inject(function($timeout) {
        var bookmark = {
            id: 1,
            link: "http://www.google.com",
            label: "Google"
        };

        this.init();
        httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "bookmarks",
            method: "getBookmarks",
            appId: null
        }).respond({
            payload: JSON.stringify([bookmark])
        });

        $scope.$digest();
        httpBackend.flush();
        $timeout.flush();

        expect($scope.bookmarkToSave.length).toEqual(0);
        expect($scope.bookmarkToDelete.length).toEqual(0);
        expect($scope.data.bookmarkLinkError).toBeUndefined();
        expect($scope.data.formErrors).toBeUndefined();
        expect($scope.resultTable.rows.length).toEqual(1);
        expect($scope.resultTable.rows[0].data.id).toEqual(bookmark.id);
        expect($scope.resultTable.rows[0].data.link).toEqual(bookmark.link);
        expect($scope.resultTable.rows[0].data.label).toEqual(bookmark.label);

        $scope.removeBookmark($scope.resultTable.rows[0]);
        $scope.$digest();

        expect($scope.data.bookmarkLinkError).toBeUndefined();
        expect($scope.data.formErrors).toBeUndefined();
        expect($scope.bookmarkToSave.length).toEqual(0);
        expect($scope.bookmarkToDelete.length).toEqual(1);
        expect($scope.bookmarkToDelete[0].id).toEqual(bookmark.id);
        expect($scope.resultTable.rows.length).toEqual(0);

        httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "bookmarks",
            method: "removeBookmark",
            appId: null,
            payload: {
                id: bookmark.id
            }
        }).respond();

        $scope.updateBookmarks();
        $scope.$digest();
        $timeout.flush();
        httpBackend.flush();
    }));

    it('Cannot add bookmark with duplicate label', inject(function($timeout) {
        var bookmark = {
            id: 1,
            link: "http://www.google.com",
            label: "Google"
        };

        var newBookmark = {
            link: "http://www.example.com",
            label: "Google"
        };

        this.init();
        httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "bookmarks",
            method: "getBookmarks",
            appId: null
        }).respond({
            payload: JSON.stringify([bookmark])
        });

        $scope.$digest();
        httpBackend.flush();
        $timeout.flush();

        expect($scope.bookmarkToSave.length).toEqual(0);
        expect($scope.bookmarkToDelete.length).toEqual(0);
        expect($scope.data.bookmarkLinkError).toBeUndefined();
        expect($scope.data.formErrors).toBeUndefined();
        expect($scope.resultTable.rows.length).toEqual(1);
        expect($scope.resultTable.rows[0].data.id).toEqual(bookmark.id);
        expect($scope.resultTable.rows[0].data.link).toEqual(bookmark.link);
        expect($scope.resultTable.rows[0].data.label).toEqual(bookmark.label);

        $scope.data.bookmark = jQuery.extend({}, newBookmark);
        $scope.addBookmark({ $valid: true });
        $scope.$digest();

        expect($scope.data.bookmarkLinkError).toEqual(false);
        expect($scope.data.formErrors).toEqual("Enter Unique Label");
        expect($scope.bookmarkToSave.length).toEqual(0);
        expect($scope.bookmarkToDelete.length).toEqual(0);
        expect($scope.data.bookmark.link).toEqual("http://www.example.com");
        expect($scope.data.bookmark.label).toEqual("Google");
        expect($scope.resultTable.rows.length).toEqual(1);

        $scope.updateBookmarks();
        $scope.$digest();
    }));

    it('Undo add bookmark', inject(function($timeout) {
        var bookmark = {
            id: 1,
            link: "http://www.google.com",
            label: "Google"
        };

        var newBookmark = {
            link: "http://www.example.com",
            label: "Example"
        };

        this.init();
        httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "bookmarks",
            method: "getBookmarks",
            appId: null
        }).respond({
            payload: JSON.stringify([bookmark])
        });

        $scope.$digest();
        httpBackend.flush();
        $timeout.flush();

        expect($scope.bookmarkToSave.length).toEqual(0);
        expect($scope.bookmarkToDelete.length).toEqual(0);
        expect($scope.data.bookmarkLinkError).toBeUndefined();
        expect($scope.data.formErrors).toBeUndefined();
        expect($scope.resultTable.rows.length).toEqual(1);
        expect($scope.resultTable.rows[0].data.id).toEqual(bookmark.id);
        expect($scope.resultTable.rows[0].data.link).toEqual(bookmark.link);
        expect($scope.resultTable.rows[0].data.label).toEqual(bookmark.label);

        $scope.data.bookmark = jQuery.extend({}, newBookmark);
        $scope.addBookmark({ $valid: true });
        $scope.$digest();

        expect($scope.data.bookmarkLinkError).toEqual(false);
        expect($scope.data.formErrors).toEqual(false);
        expect($scope.bookmarkToSave.length).toEqual(1);
        expect($scope.bookmarkToSave[0].link).toEqual(newBookmark.link);
        expect($scope.bookmarkToSave[0].label).toEqual(newBookmark.label);
        expect($scope.bookmarkToDelete.length).toEqual(0);
        expect($scope.data.bookmark.link).toEqual("");
        expect($scope.data.bookmark.label).toEqual("");
        expect($scope.resultTable.rows.length).toEqual(2);
        expect($scope.resultTable.rows[1].data.link).toEqual(newBookmark.link);
        expect($scope.resultTable.rows[1].data.label).toEqual(newBookmark.label);

        $scope.cancelConfigOption();
        $scope.$digest();
        httpBackend.flush();
        $timeout.flush();

        expect($scope.bookmarkToSave.length).toEqual(0);
        expect($scope.bookmarkToDelete.length).toEqual(0);
        expect($scope.resultTable.rows[0].data.id).toEqual(bookmark.id);
        expect($scope.resultTable.rows[0].data.link).toEqual(bookmark.link);
        expect($scope.resultTable.rows[0].data.label).toEqual(bookmark.label);

        $scope.updateBookmarks();
        $scope.$digest();
    }));

    it('Undo remove bookmark', inject(function($timeout) {
        var bookmark = {
            id: 1,
            link: "http://www.google.com",
            label: "Google"
        };

        this.init();
        httpBackend.whenPOST(baseUrl + "/rest-with-cookies/api/v1/message", {
            type: "bookmarks",
            method: "getBookmarks",
            appId: null
        }).respond({
            payload: JSON.stringify([bookmark])
        });

        $scope.$digest();
        httpBackend.flush();
        $timeout.flush();

        expect($scope.bookmarkToSave.length).toEqual(0);
        expect($scope.bookmarkToDelete.length).toEqual(0);
        expect($scope.data.bookmarkLinkError).toBeUndefined();
        expect($scope.data.formErrors).toBeUndefined();
        expect($scope.resultTable.rows.length).toEqual(1);
        expect($scope.resultTable.rows[0].data.id).toEqual(bookmark.id);
        expect($scope.resultTable.rows[0].data.link).toEqual(bookmark.link);
        expect($scope.resultTable.rows[0].data.label).toEqual(bookmark.label);

        $scope.removeBookmark($scope.resultTable.rows[0]);
        $scope.$digest();

        expect($scope.data.bookmarkLinkError).toBeUndefined();
        expect($scope.data.formErrors).toBeUndefined();
        expect($scope.bookmarkToSave.length).toEqual(0);
        expect($scope.bookmarkToDelete.length).toEqual(1);
        expect($scope.bookmarkToDelete[0].id).toEqual(bookmark.id);
        expect($scope.resultTable.rows.length).toEqual(0);

        $scope.cancelConfigOption();
        $scope.$digest();
        httpBackend.flush();
        $timeout.flush();

        expect($scope.bookmarkToSave.length).toEqual(0);
        expect($scope.bookmarkToDelete.length).toEqual(0);
        expect($scope.resultTable.rows.length).toEqual(1);
        expect($scope.resultTable.rows[0].data.id).toEqual(bookmark.id);
        expect($scope.resultTable.rows[0].data.link).toEqual(bookmark.link);
        expect($scope.resultTable.rows[0].data.label).toEqual(bookmark.label);

        $scope.updateBookmarks();
        $scope.$digest();
    }));
});