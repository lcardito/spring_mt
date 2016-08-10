(function() {
    "use strict";

    var restModelModule = angular.module("widgetRestTableModelModule", ["restangular"]);

    var MAX_RESULTS_PER_PAGE = 50;
    var START_AT_INDEX = 0;
    var DEFAULT_DIRECTION = "ASC";
    var FILTER_UPDATE_DEBOUNCE_TIME = 400;

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Configuration & Initialisation
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    restModelModule
    .config(["RestangularProvider", function(RestangularProvider) {
        setupDefaultRestangularUrlModifications(RestangularProvider);
    }]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Services
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    restModelModule
    .factory("jiraRestTableModelService", ["Restangular",
        function(Restangular) {
            var service = {
                createRestTableModel: function(app, widget, useMask, actionObjects) {

                    if (useMask == undefined) {
                        useMask = true;
                    }
                    if (useMask) {
                        showMask(true);
                    }

                    var unprocessedFilterAvailable = false;
                    var unprocessedFilterText = "";

                    widget.config.maxResults = MAX_RESULTS_PER_PAGE;
                    widget.config.startAt = START_AT_INDEX;
                    widget.config.direction = DEFAULT_DIRECTION;

                    var model = {
                        updateInProgress: false,
                        sortItems: function(propertyName, direction) {
                            widget.config.startAt = 0;
                            widget.config.direction = direction;
                            widget.config.orderBy = propertyName === "name" ? "summary" : propertyName;

                            model.updateInProgress = true;
                            updateRows();
                        },
                        pageChanged: function(currentPage) {
                            widget.config.startAt = (currentPage - 1) * widget.config.maxResults;

                            model.updateInProgress = true;
                            updateRows();
                        }
                    };

                    var updateRows = function() {};

                    updateRows = function() {
                        //If there is no new filter available or a server call is still in progress then do nothing.
                        if (unprocessedFilterAvailable === !model.updateInProgress) {
                            model.updateInProgress = true;
                            if (useMask) {
                                showMask(true);
                            }

                            if (unprocessedFilterText !== null && unprocessedFilterText !== "") {
                                widget.config.filter = unprocessedFilterText;
                            } else {
                                delete widget.config.filter;
                            }

                            Restangular.all("message").post({
                                type: app.type,
                                method: "getIssuesFromFilter",
                                appId: app.id,
                                payload: widget.config
                            })
                            .then(
                                function (message) {
                                    var undecoratedRows = JSON.parse(message.payload);

                                    model.rows = _.map(
                                        undecoratedRows.issues,
                                        function(rowItem) {
                                            return {
                                                data: convertJiraIssueRow(rowItem),
                                                actions: actionObjects,
                                                url: app.url + "/browse/" + rowItem.key,
                                                defaultAction: [],
                                                external: true
                                            };
                                        }
                                    );
                                    model.rows.totalLength = undecoratedRows.total;
                                    model.updateInProgress = false;

                                    updateRows();
                                    if (useMask) {
                                        showMask(false);
                                    }
                            }, function() {
                                model.updateInProgress = false;
                                if (useMask) {
                                    showMask(false);
                                }
                            });

                            //Clear the flag to indicate that the filter value has at least been sent to the server.
                            unprocessedFilterAvailable = false;
                        } else {
                            if (useMask) {
                                showMask(false);
                            }
                        }
                    };

                    var convertJiraIssueRow = function(rowItem) {
                        rowItem.project = "UNKNOWN";
                        rowItem.name = "Unknown";
                        rowItem.description = "Unknown";
                        rowItem.status = "Unknown";
                        rowItem.statusCategory = "Unknown";
                        rowItem.icon = {
                            src: blankImage,
                            alt: "Unknown"
                        };
                        rowItem.priorityIcon = {
                            src: blankImage,
                            alt: "Unknown"
                        };
                        rowItem.assignedImage = {
                            src: blankImage,
                            alt: "Unassigned"
                        };
                        rowItem.statusIcon = {
                            src: blankImage,
                            alt: "Unknown"
                        };

                        if (rowItem.fields.hasOwnProperty("project") && rowItem.fields.project !== null) {
                            rowItem.project = rowItem.fields.project.name;
                            rowItem.projectIcon = {
                                src: rowItem.fields.project.avatarUrls["24x24"],
                                alt: rowItem.fields.project.name
                            };
                        }

                        if (rowItem.fields.hasOwnProperty("summary") && rowItem.fields.summary !== null) {
                            rowItem.name = rowItem.fields.summary;
                        }
                        if (rowItem.fields.hasOwnProperty("description")) {
                            rowItem.description = rowItem.fields.description;
                        }

                        if (rowItem.fields.hasOwnProperty("issuetype") && rowItem.fields.issuetype !== null) {
                            rowItem.icon = {
                                src: rowItem.fields.issuetype.iconUrl,
                                alt: rowItem.fields.issuetype.name,
                            };
                        }
                        if (rowItem.fields.hasOwnProperty("priority") && rowItem.fields.priority !== null) {
                            rowItem.priorityIcon = {
                                src: rowItem.fields.priority.iconUrl,
                                alt: rowItem.fields.priority.name
                            }
                        }
                        if (rowItem.fields.hasOwnProperty("status") && rowItem.fields.status !== null) {
                            rowItem.status = rowItem.fields.status.name;
                            rowItem.statusIcon = {
                                src: rowItem.fields.status.iconUrl,
                                alt: rowItem.fields.status.name,
                            };
                        }
                        if (rowItem.fields.status.hasOwnProperty("statusCategory")) {
                            rowItem.statusCategory = rowItem.fields.status.statusCategory.name;
                        }
                        if (rowItem.fields.assignee != null && rowItem.fields.assignee !== null) {
                            rowItem.assignedImage = {
                                src: rowItem.fields.assignee.avatarUrls["24x24"],
                                alt: rowItem.fields.assignee.displayName
                            };
                        }
                        return rowItem;
                    };

                    var filterApplied = function(filterText) {
                        //The filter has changed, or the user has requested that the filter be re-run, so store the new
                        //filter text in the "unprocessed" variable and set the flag to indicate that a new filter is
                        //present but hasn't been processed yet.  Note that there may have already been an unprocessed
                        //filter; if so we just overwrite it.  This is deliberate so that we can ignore intermediate
                        //filter values when the filter is changing more quickly than the server can respond to
                        //requests.
                        unprocessedFilterAvailable = true;
                        unprocessedFilterText = filterText;

                        widget.config.startAt = 0;

                        //Call the update function.  At this point we neither know nor care whether the new filter will
                        //be sent to the server immediately.
                        updateRows();
                    };

                    //The lodash docs are a bit confusing, but by default debounce() in fact does what we want: the
                    //wrapped function will not be called until changes have stopped happening for at least as long as
                    //the timeout interval.  In other words, if the user keeps typing indefinitely (say, by typing and
                    //then deleting the same character over and over) then the function will never execute.
                    model.filterApplied = _.debounce(filterApplied, FILTER_UPDATE_DEBOUNCE_TIME);

                    // Call filterApplied() with an empty filter so that the initial, unfiltered, rows are loaded.
                    filterApplied();

                    return model;
                }
            }

            return service;
        }
    ]);
})();
