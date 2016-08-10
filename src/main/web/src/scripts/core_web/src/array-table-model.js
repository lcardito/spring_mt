(function () {
	// NOTE: This will not automatically update rows!

	// This is a utility function that can create an object that will sit between spectrum-table and a javascript array that
	// supports "filter" and "limit" parameters.  This object will take care of reacting to filter changes - it
	// will automatically refresh the data with appropriate debouncing. In the future it may be extended to also
	// handle sorting and paging.
	//
	// To use it:
	//
	// 1. Call createArrayTableModel() and put the resulting model in the angular scope such that your spectrum_table
	//    can access it. createArrayTableModel() takes two parameters:
	//       array:                 The javascript array of data to use
	//       rowDecorator:          A function that takes a single row as returned from the server and returns a
	//                              row suitable for display by spectrum_table.  It doesn't matter whether or not you
	//                              return the same object or a new one.
	//
	// 2. Bind the "rows" property of your spectrum-table to the "rows" property of the table model.
	//
	// 3. Bind the "filter-applied" property of your spectrum-table to the "filterApplied" property of the table model.
	//
	// 4. Bind the "update-in-progress" property of your spectrum-table to the "updateInProgress" property of the table
	//    model.
	// 5. If the "tableRowLimit" parameter equals 0 (or less) there will be NO limit for the number of rows to be
	//    displayed

	"use strict";
	var arrayModelModule = angular.module("spectrumArrayTableModelModule", []);

	var TABLE_ROW_LIMIT = 50;
	var FILTER_UPDATE_DEBOUNCE_TIME = 400;

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Services
	///////////////////////////////////////////////////////////////////////////////////////////////////
	arrayModelModule
		.factory("arrayTableModelService", ["$timeout", function ($timeout) {
			var service = {
				createArrayTableModel: function (undecoratedRows, rowDecorator, useMask, filterableColumns, tableRowLimit, callback) {
					var model = {
						updateInProgress: false
					};

					if (useMask == undefined) {
						useMask = true;
					}
					if (filterableColumns == undefined) {
						filterableColumns = [];
					}

					if (tableRowLimit == undefined) {
						tableRowLimit = TABLE_ROW_LIMIT;
					}

					var filterApplied = function (filterText) {
						model.updateInProgress = true;
						filterText = filterText ? filterText.toLowerCase() : null;

						$timeout(function () {
							var filteredRows = null;
							if (!filterText || filterText === "") {
								filteredRows = model.undecoratedRows;
							} else {
								filteredRows = _.filter(model.undecoratedRows, function (row) {
									var foundMatch = false;
									for (var itemIndex in filterableColumns) {
										var item = filterableColumns[itemIndex];
										if (!row.hasOwnProperty(item)) {
											continue;
										}
										try {
											if (row[item].toLowerCase().indexOf(filterText) !== -1) {
												foundMatch = true;
												break;
											}
										} catch (e) {
											//Not a string column, ignore
										}
									}
									return foundMatch;
								});
							}
							if (filteredRows != null) {
								if (tableRowLimit < 1) {
									model.rows = _.map(filteredRows, rowDecorator);
								} else {
									var limitedRows = filteredRows.slice(0, TABLE_ROW_LIMIT);
									model.rows = _.map(limitedRows, rowDecorator);
								}
							} else {
								model.rows = [];
							}

//							model.rows = _.sortBy(model.rows, function(row) {
//								return row.data[orderByInitial];
//							});

							model.rows.totalLength = undecoratedRows === undefined ? 0 : undecoratedRows.length;

							if (useMask) {
								showMask(false);
							}
							if (callback !== undefined) {
							    callback();
							}
							model.updateInProgress = false;
						});
					};

					model.addRow = function (item) {
						model.undecoratedRows.push(item);
						model.rows.push(rowDecorator(item));
						model.sortRows();
					};
					model.sortRows = function () {
						model.rows.sort(function (a, b) {
							var name1 = a.data.name.toLowerCase;
							var name2 = b.data.name.toLowerCase;
							if (name1 < name2) return -1;
							if (name1 > name2) return 1;
							return 0;
						});
					}
					model.removeRow = function (itemId) {
						var rowToRemove = _.filter(model.rows, function (row) {
							return row.data.id === itemId;
						});
						if (rowToRemove.length > 0) {
							_.remove(model.rows, rowToRemove[0]);
							_.remove(model.undecoratedRows, model.getUndecoratedRow(itemId));
						}
						model.sortRows();
					};
					model.getUndecoratedRow = function (rowId) {
						return model.undecoratedRows, _.filter(model.undecoratedRows, function (row) {
							return row.id === rowId;
						})[0]
					}
					model.undecoratedRows = undecoratedRows;

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
		}]);
})();
