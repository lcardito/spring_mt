var baseUrl = "http://www.example.com";

var testModel = {
  'structure': 'Header with two columns',
  'rows': [
	{
	  'columns': [
		{
		  'styleClass': 'col-md-12',
		  'widgets': [],
		  '$$hashKey': '023',
		  'cid': 1
		}
	  ],
	  '$$hashKey': '01X'
	}
  ],
  'title': 'Dashboard',
  'titleTemplateUrl': 'partials/widgets/dashboardTitleTemplate.html',
  'editTemplateUrl': 'partials/widgets/dashboardEdit.html'
};

var testUtils = {
	getUserAuthState: function() {
    	return {
    		isLoggedIn: true,
    		isAdmin: true,
    		currentUserId: 1,
    		currentUserName: "admin",
    		isActive: true
    	};
    },

    getPersonalisedDashboardModel: function(widgets){
		testModel.rows[0].columns[0].widgets = widgets;
		testModel.scope = function() {
			return {
				model: testModel,
				'$watch': function(value, callback){}
			};
		};
		return testModel;
    },

    getSupportedApps: function(){
		var supportedApps = [{
			id: 1,
			name: "JIRA"
		},
		{
		    id: 2,
		    name: "Confluence"
		}];
    	return supportedApps;
    },


    getAvailableApps: function(){
		var availableApps = [{
			id: 1,
			supportedAppId: 1,
			type: "JIRA",
			status: "RUNNING",
			linkConfigured: true,
            name: "My JIRA"
		},
		{
            id: 2,
            supportedAppId: 2,
            type: "Confluence",
            status: "STOPPED",
            linkConfigured: true,
            url: "http://confluence.clearvision.com",
            name: "My Confluence"
        },
        {
            id: 3,
            supportedAppId: 3,
            type: "Bitbucket Server",
            linkConfigured: false,
            status: "NOT_CONFIGURED",
            name: "My BitBucker Server",
        },
        {
            id: 4,
            supportedAppId: 4,
            type: "Jenkins",
            linkConfigured: true,
            status: "INVALID_SERVER",
            name: "My Jenkins",
        }];

		return availableApps;
    },

    getJIRAWidget: function(){
		var testJiraWidget = {
			config: {},
			title: 'My Test JIRA widget',
            dashboardId: 3,
			id: 1
		};

		return testJiraWidget;
    },

    getConfluenceWidget: function() {
		var testConfluenceWidget = {
			config: {
			},
			title: 'My Test Confluence widget'
		};

		return testConfluenceWidget;
    },

    getNexusWidget: function() {
        var testNexusWidget = {
            title: 'My Test Nexus widget',
            id: 1,
            height: 200
        };

        return testNexusWidget;
    },

    getTaskTimers: function() {
        var app = this.getAvailableApps()[0];

        return [{
            id: 1,
            appId: app.id,
            remoteId: "TEST-1",
            startTime: new Date().getTime(),
            elapsedTime: 85
        }];
    },

    getApplicationListWidget: function() {
        var widget = {
            config: {},
            title: 'My Application List widget',
            dashboardId: 5,
            id: 1
        };

        return widget;
    }

};
