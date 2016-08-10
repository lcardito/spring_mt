'use strict';

describe('Task Timer', function() {
	beforeEach(module('spectrumTaskTimerModule'));

    var taskTimer,
        httpBackend,
        taskTimerItem;

	beforeEach(inject(function(_taskTimer_, _$httpBackend_) {
        taskTimer = _taskTimer_;
		httpBackend = _$httpBackend_;

        taskTimerItem = testUtils.getTaskTimers()[0];
	}));

    it('Test start and got successfully completed task timer', function() {
        httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/task-timer/start", {
            appId: taskTimerItem.appId,
            remoteId: taskTimerItem.remoteId
        }).respond({
            completedTaskTimer: {
            },
            currentTaskTimer: {
            },
            successCompletedTaskTimer: true
        });

        taskTimer.start(testUtils.getAvailableApps()[0], taskTimerItem.remoteId);
        $(".bootbox").remove();
        httpBackend.flush();

        expect($('.bootbox:contains("Something went wrong whilst logging time against issue")').length).toBe(0);
        expect($('.bootbox:contains("There was an issue performing this action. Please refresh the page and try again.")').length).toBe(0);
        $(".bootbox").remove();
    });

    it('Test start and got failing completed task timer', function() {
        httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/task-timer/start", {
            appId: taskTimerItem.appId,
            remoteId: taskTimerItem.remoteId
        }).respond({
            completedTaskTimer: taskTimerItem,
            currentTaskTimer: {
            },
            successCompletedTaskTimer: false
        });

        taskTimer.start(testUtils.getAvailableApps()[0], taskTimerItem.remoteId);

        httpBackend.flush();

        expect($('.bootbox:contains("Something went wrong whilst logging time against issue")').length).toBe(1);
        expect($('.bootbox:contains("There was an issue performing this action. Please refresh the page and try again.")').length).toBe(0);
        $(".bootbox").remove();
    });

    it('Test start and got Internal server error', function() {
        httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/task-timer/start", {
            appId: taskTimerItem.appId,
            remoteId: taskTimerItem.remoteId
        }).respond(500, {});

        taskTimer.start(testUtils.getAvailableApps()[0], taskTimerItem.remoteId);
        $(".bootbox button[data-bb-handler='confirm']").click();
        httpBackend.flush();

        expect($('.bootbox:contains("Something went wrong whilst logging time against issue")').length).toBe(0);
        expect($('.bootbox:contains("There was an issue performing this action. Please refresh the page and try again.")').length).toBe(1);
        $(".bootbox").remove();
    });

    it('Test stop and got successfully completed task timer', function() {
        expect(taskTimer).toBeDefined();

        httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/task-timer/" + taskTimerItem.id + "/stop").respond({
            completedTaskTimer: {
            },
            currentTaskTimer: {

            },
            successCompletedTaskTimer: true
        });

        taskTimer.stop(testUtils.getAvailableApps()[0], taskTimerItem.id);
        $(".bootbox button[data-bb-handler='confirm']").click();
        httpBackend.flush();

        expect($('.bootbox:contains("Something went wrong whilst logging time against issue")').length).toBe(0);
        expect($('.bootbox:contains("There was an issue performing this action. Please refresh the page and try again.")').length).toBe(0);
        $(".bootbox").remove();
    });

    it('Test stop and got failing completed task timer', function() {
        expect(taskTimer).toBeDefined();

        httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/task-timer/" + taskTimerItem.id + "/stop").respond({
            completedTaskTimer: {
            },
            currentTaskTimer: {

            },
            successCompletedTaskTimer: false
        });

        taskTimer.stop(testUtils.getAvailableApps()[0], taskTimerItem.id);
        $(".bootbox button[data-bb-handler='confirm']").click();
        httpBackend.flush();

        expect($('.bootbox:contains("Something went wrong whilst logging time against issue")').length).toBe(1);
        expect($('.bootbox:contains("There was an issue performing this action. Please refresh the page and try again.")').length).toBe(0);
        $(".bootbox").remove();
    });

    it('Test stop and got Internal server error', function() {
        expect(taskTimer).toBeDefined();

        httpBackend.expectPOST(baseUrl + "/rest-with-cookies/api/v1/task-timer/" + taskTimerItem.id + "/stop").respond(500);

        taskTimer.stop(testUtils.getAvailableApps()[0], taskTimerItem.id);
        $(".bootbox button[data-bb-handler='confirm']").click();
        httpBackend.flush();

        expect($('.bootbox:contains("Something went wrong whilst logging time against issue")').length).toBe(0);
        expect($('.bootbox:contains("There was an issue performing this action. Please refresh the page and try again.")').length).toBe(1);
        $(".bootbox").remove();
    });
});
