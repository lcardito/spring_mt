(function() {
    // This is a utility function that can create an object that will sit between spectrum-table and a REST API that
    // supports "filter" and "limit" query parameters.  This object will take care of reacting to filter changes - it
    // will automatically refresh the data with appropriate debouncing. In the future it may be extended to also
    //handle server-side sorting and paging.
    //
    // To use it:
    //
    // 1. Call createRestTableModel() and put the resulting model in the angular scope such that your spectrum_table
    //    can access it. createRestTableModel() takes two parameters:
    //       url:                   The base URL of the REST endpoint from which you want to retrieve data (eg "users")
    //       rowDecorator:          A function that takes a single row as returned from the server and returns a
    //                              row suitable for display by spectrum_table.  It doesn't matter whether or not you
    //								return the same object or a new one.
    //       additionalQueryParams: A map with additional properties to be added to the queryParameters object. If no
    //                              additional query parameters are needed don't include this parameter in the method.
    //           Example: Using "{"last-sequence-only":false, "title":$scope.process.title}" as a parameter
    //                    will add the parameters last-sequence-only and title to the existing queryParameters object.
    //
    // 2. Bind the "rows" property of your spectrum-table to the "rows" property of the table model.
    //
    // 3. Bind the "filter-applied" property of your spectrum-table to the "filterApplied" property of the table model.
    //
    // 4. Bind the "update-in-progress" property of your spectrum-table to the "updateInProgress" property of the table
    //    model.

    "use strict";
    var restModelModule = angular.module("spectrumRestTableModelModule", []);

    var TABLE_ROW_LIMIT = 50;
    var FILTER_UPDATE_DEBOUNCE_TIME = 400;

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Configuration & Initialisation
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    restModelModule
    .config(["RestangularProvider", function(RestangularProvider) {
        RestangularProvider.setBaseUrl(baseUrl + "/rest-with-cookies/api/v1");
        RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
            //This session has been expired (possibly due to multiple concurrent logins being attempted as the same user).
            if (operation === "getList" && (data.hasOwnProperty("error") || typeof(data) == "string")) {
                return [];
            }
            return data;
        });
    }]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Services
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    restModelModule
    .factory("restTableModelService", ["Restangular",
        function(Restangular) {
            var service = {
                createRestTableModel: function(url, rowDecorator, additionalQueryParams, useMask) {
                    if (useMask == undefined) {
                        useMask = true;
                    }
                    if (useMask) {
                        showMask(true);
                    }
                    var model = {updateInProgress: false};
                    var unprocessedFilterAvailable = false;
                    var unprocessedFilterText = "";
                    var updateRows = function() {};

                    updateRows = function() {
                        //If there is no new filter available or a server call is still in progress then do nothing.
                        if (unprocessedFilterAvailable === !model.updateInProgress) {
                            model.updateInProgress = true;
                            if (useMask) {
                                showMask(true);
                            }

                            //Build the query parameters. We want to leave the filter parameter off altogether if it's
                            //empty.
                            var queryParameters = {limit: TABLE_ROW_LIMIT};
                            if (unprocessedFilterText !== null && unprocessedFilterText !== "") {
                                queryParameters.filter = unprocessedFilterText;
                            }

                            if (additionalQueryParams) {
                                _.defaults(queryParameters, additionalQueryParams);
                            }
                            Restangular.all(url).getList(queryParameters).then(function(undecoratedRows) {
                                model.rows = _.map(undecoratedRows, rowDecorator);
                                model.rows.totalLength = undecoratedRows.totalLength;
                                model.updateInProgress = false;

                                //Now that the server call has completed call this function again in case any updates
                                //to the filter happened while the call was in progress.
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

                    var filterApplied = function(filterText) {
                        //The filter has changed, or the user has requested that the filter be re-run, so store the new
                        //filter text in the "unprocessed" variable and set the flag to indicate that a new filter is
                        //present but hasn't been processed yet.  Note that there may have already been an unprocessed
                        //filter; if so we just overwrite it.  This is deliberate so that we can ignore intermediate
                        //filter values when the filter is changing more quickly than the server can respond to
                        //requests.
                        unprocessedFilterAvailable = true;
                        unprocessedFilterText = filterText;

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
            };

            return service;
        }
    ]);
})();
