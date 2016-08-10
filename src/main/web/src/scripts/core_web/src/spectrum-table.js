(function () {
    /*
    This directive is to be used whenever a table of data needs to be displayed in Spectrum.
    Note that 'id' is not a defined attribute but should be applied in the calling HTML
        - Format : "tb-spec-<section>" - example : "tb-spec-users" for users table, "tb-spec-groups" for groups table
        - Usage : the last component (past the last "-") will be used in generating IDs for elements in the table
            - Example of a generated id in the table with id "tb-spec-users" : "btn-spec-users-add-action"

    attributes:
    - addActions : Either an array of objects defining one addAction each, or a single object defining a single addAction
                   addActions will be condensed into a dropdown if there are more than one
        - Specification:
            - FOR TABLES WITH 1 ADDACTION : Object with three properties:
                - name : The name of the button
                - icon : short name of a glyphicon. Example for a pencil icon (glyphicon-pencil) : icon: "pencil"
                - run : Either a link (String) to give to the button or a function (no params) to run when it is clicked
            - FOR TABLES WITH >1 ADDACTION : Array of objects matching the above (three properties)
                - NB: to create a divider in the dropdown, add an empty object to the array  ( {run: ...}, {}, {run: ...} )
        - Usage:
            - FOR TABLES WITH 1 ADDACTION:
                - Define as "$scope.addActions = {name: "someName", icon: "someIcon", run: "String/function"};"
            - FOR TABLES WITH >1 ADDACTION:
                - Define as "$scope.addActions = [ {name: "someName", icon: "someIcon", run: "String/function"}, {...} ];"
            - Use in the spectrum-table attribute : add-actions="addActions"

    - addActionsTitle : String for naming the dropdown trigger created by having more than one addAction
                        If no addActionsTitle is defined, the dropdown will be named "Add" by default
        - Usage:
            - Define in the spectrum-table attribute : add-actions-title="someString"

    - headings : Map of "property name" -> "display name" - allows selection of displayed data while naming its column
        - Specification:
            - Array of objects containing one property -> display name mapping each
            - [ { <propertyName> : "Display Name" }, ... ]
            - The order of these mappings in the array will determine the order the columns are displayed on the page
        - Usage:
            - Define in the spectrum-table attribute : headings="[{<propertyName>: "Display Name"}]"

    - rows : The data you wish to display in the table as well as actions associated with that data
        - Specification:
            - Array of objects with three properties each:
                - data : The data for one row (EG one user, one group). Must have properties defined in headings attribute
                    - Can take an extra property "iconClass" to define an icon to display to the left of the first column
                    - AVAILABLE VALUES:
                        - "spec-data-internal" (spectrum logo)
                        - "spec-data-user-external" (glyphicon-user)
                        - "spec-data-group-external" (glyphicon-folder-open)
                - actions : Array of objects representing one 'Manage' operation each.
                            Condensed into drop-downs for EVERY row if at least ONE row has >1 action.
                            NB: To create a divider in the dropdown, add an empty object to the array
                                ( {run: ...}, {}, {run: ...} )
                            Four properties:
                    - name : The name of the button
                    - icon : As with addActions - glyphicon. Example for a search icon (glyphicon-search) : icon : "search"
                    - class : A bootstrap class to apply to the button. Example : 'danger' for a red button.
                              Class is not applied if actions are condensed for this table
                    - run : Either a link (String) to give to the button or a function that will be run when it is clicked
                            Function receives @param "data" which will be the unmodified data associated with this row
                - defaultAction : An action object that will be run when the row itself is clicked
                                  Can differ per-row
                                  If at least one row has a defaultAction all rows should have a defaultAction
                                  If present for this table, changes the table to a .table-hover with cursor: pointer
                                  One property:
                    - run : Either a link (String) to go to or a function to run when the row is clicked
                            Function received @param "data" which will be the unmodified data associated with this row
        - Usage:
            - After getting/creating your list of data (EG from the server) in your Angular controller...
            - $scope.something = _.map(somethingList, function(something) {
                    var actionObjects = [ {name: "Edit", icon: "pencil", class: "danger", run: function(data) { } } ];
                    var defaultAction = { run: function(data) { window.location = data.url; } };
                    //If you want an icon next to the first column of each row...
                        something.iconClass = someFlag ? "spec-data-internal" : "spec-data-external";
                    return { data : something, actions : actionObjects, defaultAction : defaultAction };
              } );
            - As spectrum-table attribute : rows="something"

    - emptyMessage : String to display in an infobox when the table is empty
        - Usage:
            - Define in the spectrum-table attribute : empty-message="Nothing to Display!"

    - popoverRules : Map of "property name" -> "popover rules" - allows you to select specific columns by their property
                     name to apply spectrum-popover to for truncating long fields with tooltips and maintaining styles.
        - Specification:
            - Object containing one key (property name) + value (object with properties "cutoff" + "placement") per column
        - Usage:
            - Define in the spectrum-table attribute : popover-rules="{name: {cutoff: "35", placement: "right"}, ...}"
            - Above will truncate the column displaying the "name" property to 35 chars, tooltip appearing to the right

    - orderableColumns: String containing comma-separated list of object property names that the user can order by
                        Default if not specified: no orderable columns
        - Usage:
            - define in the spectrum-table attribute : orderable-columns="name, url, someProperty"

    - orderReverseInitial: boolean specifying whether the ordering should be reversed on table initialisation
                           Default if attribute not specified: false
        - Usage:
            - define in the spectrum-table attribute : order-reverse-initial="true || false"

    - orderByInitial: string specifying the object property to order the table by on table initialisation
                     Default if attribute not specified: left-most visible table column
        - Usage:
            - define in the spectrum-table attribute : order-by-initial="id"

    - gridMode: A boolean indicating whether the table will be shown in grid mode.  If gridModeSelectable is true then this
                flag essentially controls whether the table will be shown in grid mode *initially*.

    - gridModeSelectable: A boolean indicating whether the user should be allowed to change between normal and grid
                          display modes themselves.

    - gridStyle: Controls the style of the grid.  At the moment there are two options, "logo", which is rendered with
                 large boxes and "icon" which is rendered with smaller ones.

    - gridColourColumn: The name of the data column that contains the colour (in the form of an "RRGGBB" hex string) of the
                        row when rendered as a grid box.

    - gridPictureColumn: The name of the data column that contains the string used to display the large logo or icon in the
                         grid box.  If gridStyle is "logo" then this string will be used to construct a reference to one of
                         our logo font characters (eg. valid values are "bamboo" and "bbserver").  If gridStyle is "icon" then
                         this string will be used to construct a reference to a bootstrap glyphicon (eg. valid values are
                         "ok" and "refresh").

    - gridStatusIconColumn: The name of the data column that contains a string used to construct a "status" icon that will
                            be shown when gridStyle is "logo".  This will be a reference to a bootstrap glyphicon (eg.
                            valid values are "ok" and "refresh").

    - gridTextColumn: The name of the data column that contains the string to be shown in the grid box for this row.  This
                      will often be one of the "main" columns from the normal table view such as "name" or "title".

    - filterable: A boolean indicating whether the filter input form should be shown.

    - filterable-columns: An array of the column names over which the filter will be applied.  This list should match the
                          list of columns over which the filter will be applied by the application (spectrum-table itself
                          doesn't actually perform any filtering).  It is used to highlight filter text matches.  Without
                          it spectrum-table would have to apply filter text matches to all columns which may be incorrect.
        - Example:
            - filterable-columns="["name", "fullName"]"

    - filter-prompt: The text to be displayed as a placeholder in the filter input box.

    - filter-applied: A function to be called when the user "applies" (ie. changes or re-runs) the filter.  The new filter
                      text will be passed as the first and only parameter to this function.

    - update-in-progress: A boolean that indicates that a filter is being processed and that the currently displayed table
                          rows may thus be out-of-date.  This value should be changed by applications and is read by
                          spectrum-table.

    - row-description-plural: A string containing the plural form of the data type shown in the table.
        - Example:
            - row-description-plural="users"

    - picture-columns: An array of strings that represent the name of the column that are expected to have pictures/icons

    - imageColumns: An array of strings that represent the name of the column that are expected to be images (will be
                    added as an <img src="item.src" alt="item.alt" title="item.alt" />. Note the row data for that column
                    needs to be { src: "blah.jpg", alt: "blah_text" }

    - is-selector-table: A boolean to enable the onClick and onDblClick events required for selectors

    - elements-total-length: The maximum size the table can reach for the given elements (this property usually comes from
      the server)
    */

    "use strict";
    var spectrumTableModule = angular.module("spectrumTableModule", [
        "ngSanitize",
        "spectrumPopoverModule"
    ]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Directives
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    spectrumTableModule
        .directive("spectrumTable", ["$q", function ($q) {
            var link = function ($scope, element, attributes) {
                // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
                // All the code samples on MDN are either MIT licenced or in the public domain.
                var escapeRegExp = function (string) {
                    return string ? string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : null;
                };

                //Deliberately set to undefined to respect any order provided by external apps
                $scope.orderBy = attributes.orderByInitial ? attributes.orderByInitial : undefined; //_.keys($scope.headings[0])[0];
                $scope.shouldReverse = attributes.orderReverseInitial && attributes.orderReverseInitial === "true";

                var MAX_RESULTS_PER_PAGE = 50;
                $scope.pagination = {
                    currentPage: 1,
                    maxPaginationSize: 5,
                    itemsPerPage: MAX_RESULTS_PER_PAGE,
                    setToPageNumber: function(pageNumber) {
                        $scope.pagination.currentPage = pageNumber;
                    }
                };

                if ($scope.isSelectorTable) {
                    $scope.idSuffix = $scope.id.replace("tb-spec-", "");
                } else {
                    $scope.idSuffix = attributes.id.substr(attributes.id.lastIndexOf("-") + 1);
                }
                $scope.filter = {
                    text: null
                };

                $scope.itemClicked = function (item) {
                    if (!$scope.isSelectorTable) {
                        return;
                    }
                    item.isSelected = !item.isSelected;
                    $scope.updateActionButtons();
                };

                $scope.itemDoubleClicked = function (row) {
                    if (!$scope.isSelectorTable || !$scope.doubleClickFunction) {
                        return;
                    }
                    var currentlySelected = [];
                    $scope.rows.forEach(function (item) {
                        if (item.isSelected) {
                            currentlySelected.push(item.data.id);
                        }
                        item = _.assign(item, {
                            isSelected: false
                        });
                    });
                    row.isSelected = true;
                    $scope.doubleClickFunction();
                    $scope.rows.forEach(function (item) {
                        if (currentlySelected.indexOf(item.data.id) !== -1) {
                            item = _.assign(item, {
                                isSelected: true
                            });
                        }
                    });
                    $scope.updateActionButtons();
                };


                $scope.gridItemClicked = function ($event, action, row) {
                    var targetElement = $event.target;
                    while (targetElement.parentNode) {
                        if (_.contains(targetElement.className.split(" "), "dropdown")) {
                            return;
                        }

                        targetElement = targetElement.parentNode;
                    }

                    $scope.actionClicked(action, row);
                };

                $scope.itemEntered = function ($event, row) {
                    if (row.data.preview) {
                        var previewData = row.data.preview;
                        var $target = $($event.target).closest("tr");
                        if (!$target.data("bs.popover")) {
                            var initialContent = '<div class="spectrum-table-row-preview" for="' + $scope.id + '"><div class="overlay"></div></div>';
                            $target.popover({
                                content: initialContent,
                                trigger: "hover",
                                title: previewData.title,
                                html: true,
                                placement: "auto top",
                                container: "body",
                                delay: { "show": 500, "hide": 0 },
                                template: '<div class="popover spectrum-table-row-preview-popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
                            });

                            // TODO: We should use event "inserted.bs.popover" to display spinner immediately when popover is rendered. It is available since 3.3.5
                            $target.on("shown.bs.popover", function() {
                                var popoverData = $target.data("bs.popover");

                                if (popoverData.options.content == initialContent) {
                                    var $preview = $("div.spectrum-table-row-preview", popoverData.$tip);
                                    $preview.spin({
                                        length: 5,
                                        width: 2,
                                        radius: 5
                                    });

                                    var fillPreviewData = function(content) {
                                        var iframe = document.createElement("iframe");
                                        iframe.setAttribute("src", "about:blank");
                                        iframe.setAttribute("scrolling", "no");
                                        $preview.prepend(iframe);
                                        var iframeDocument = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);

                                        if (iframeDocument) {
                                            iframeDocument.open();
                                            iframeDocument.write(content);
                                            iframeDocument.close();
                                            iframe.onload = function () {
                                                $preview.spin(false);
                                            };
                                        }

                                        popoverData.options.previewContent = content;
                                    };

                                    var previewDataContent;

                                    if (popoverData.options.previewContent) {
                                        // we have cached preview content don't need to request Spectrum, just fill the iframe
                                        fillPreviewData(popoverData.options.previewContent);
                                        return;
                                    } else if (typeof previewData.content == "function") {
                                        previewDataContent = previewData.content();
                                    } else {
                                        previewDataContent = previewData.content;
                                    }

                                    if (typeof previewDataContent == "string") {
                                        $preview.html(previewDataContent);
                                        popoverData.options.content = $preview[0].outerHTML;
                                    } else {
                                        $q.when(previewDataContent).then(function (content) {
                                            fillPreviewData(content);
                                        }, function (error) {
                                            $preview.html('<div class="alert alert-danger"><strong>Error!</strong> The page preview could not be loaded.</div>');
                                        });
                                    }
                                }
                            });

                            $target.popover("toggle");
                        }
                    }
                };

                //This method is called by the template and returns an object that contains the actual string(s) to be
                //displayed in each table cell.  We do it this way so that we can apply both filter highlighting and
                //truncation of long values dynamically.  The object returned will always have an attribute called
                //"baseText".  It may have attributes called "extendedText" (to be displayed in a popup) and
                //"extendedPlacement" containing "left" / "right" etc. (describing the placement of the popup).
                $scope.getCellData = function (row, heading) {
                    //We have to be careful about the order in which we process strings here so that we avoid unsightly
                    //artifacts.  So, for each cell data string supplied to the table, we:
                    //
                    //   1. Perform any truncation if required (ie. truncating the baseText value and sticking an ellipsis
                    //      on the end and moving the full value to extendedText).
                    //
                    //   2. Escape all HTML characters so that any data that contains HTML characters isn't
                    //      interpreted as HTML when displayed.  We do this to prevent conflicts with the <span>
                    //      elements we add later rather than to defend against HTML-injection attacks.  Angular should
                    //      still sanitise any data-driven HTML we display in a template.
                    //
                    //   3. Add <span> elements to baseText, and extendedText if present, to highlight filter matches.
                    //
                    //If we did (1) after (2) we might miscount the characters because single characters such as '<' are
                    //turned into multiple characters ('&lt;') when escaped.  If we did (2) after (3) we would end up
                    //escaping our own <span> elements used for highlighting filter matches.  Also, for the record, we
                    //couldn"t do (1) after (3) either ;)
                    var filterRegExp = new RegExp(escapeRegExp(_.escape($scope.filter.text)), "gi");

                    function highlightFilterMatches(text) {
                        if ($scope.filterableColumns && _.contains($scope.filterableColumns, heading.propertyName) && $scope.filter.text) {
                            return text.replace(filterRegExp, "<span class='spectrum-filter-match'>$&</span>");
                        } else {
                            return text;
                        }
                    }

                    var headerProperty = heading.propertyName;
                    if(heading.displayValue !== undefined) {
                        headerProperty = heading.displayValue;
                    }

                    var cellData = {
                        baseText: row.data[headerProperty]
                    };

                    if (!cellData.baseText) {
                        return cellData;
                    }

                    if ($scope.popoverRules) {
                        var popoverRule = $scope.popoverRules[heading.propertyName];
                        if (popoverRule) {
                            if (cellData.baseText.length > popoverRule.cutoff) {
                                if (popoverRule.suffix === undefined)
                                    popoverRule.suffix = "...";

                                cellData.extendedText = cellData.baseText;
                                cellData.baseText = cellData.baseText.substring(0, popoverRule.cutoff) + popoverRule.suffix;

                                cellData.extendedText = _.escape(cellData.extendedText);
                                cellData.extendedText = highlightFilterMatches(cellData.extendedText);

                                cellData.extendedPlacement = popoverRule.placement;
                            }
                        }
                    }
                    cellData.baseText = _.escape(cellData.baseText);
                    cellData.baseText = highlightFilterMatches(cellData.baseText);

                    return cellData;
                };

                $scope.changeTableOrder = function (propertyName) {
                    // When sorting $scope.rows, the $scope.rows.length gets deleted. So, we need to add it back
                    // after the sorting is complete
                    var totalRows = $scope.rows.totalLength;

                    if ($scope.orderableColumns === undefined || $scope.orderableColumns.indexOf(propertyName) < 0) {
                        return;
                    }

                    if ($scope.orderBy === propertyName) {
                        $scope.shouldReverse = !$scope.shouldReverse;
                    } else {
                        $scope.shouldReverse = false;
                    }

                    if ($scope.sortItems !== undefined) {
                        $scope.sortItems(propertyName, $scope.shouldReverse ? 'DESC' : 'ASC');
                    } else {
                        $scope.rows = _.sortBy($scope.rows, function(row) {
                            return row.data[propertyName];
                        });
                        if ($scope.shouldReverse) {
                            $scope.rows.reverse();
                        }
                    }

                    $scope.pagination.currentPage = 1;
                    $scope.orderBy = propertyName;
                    $scope.rows.totalLength = totalRows;
                };

                $scope.getSortValue = function () {
                    if ($scope.orderBy === undefined || $scope.sortItems !== undefined) {
                        return undefined;
                    }

                    return "data." + $scope.orderBy;
                };

                $scope.actionClicked = function (action, row) {
                    if (typeof action.run === "string") {
                        if (action !== "") {
                            window.location = action.run;
                        }
                    } else if (typeof action.run === "function") {
                        if (row === undefined) {
                            action.run();
                        } else {
                            action.run(row.data);
                        }
                    }
                };

                $scope.isPictureColumn = function (heading) {
                    if ($scope.isImageColumn(heading)) {
                        return true;
                    }
                    if ($scope.pictureColumns === null || $scope.pictureColumns === undefined) {
                        return false;
                    }
                    return $scope.pictureColumns.indexOf(heading.propertyName) !== -1;
                }
                $scope.isImageColumn = function (heading) {
                    if ($scope.imageColumns === null || $scope.imageColumns === undefined) {
                        return false;
                    }
                    return $scope.imageColumns.indexOf(heading.propertyName) !== -1;
                }

                $scope.$watch("headings", function (headings) {
                    $scope.headingMap =
                        _.map(headings,
                            function (heading) {
                                return {
                                    displayValue: heading.displayValue,
                                    propertyName: _.keys(heading)[0],
                                    displayName: _.values(heading)[0]
                                };
                            }
                        );
                });

                $scope.$watch("rows", function (rows) {
                    // removing page preview popovers for the table
                    $(".spectrum-table-row-preview[for="+ $scope.id +"]").closest(".popover").remove();

                    var actionArrays = _(rows).pluck("actions").without(undefined);

                    var maxActionsLength;
                    if (actionArrays.size() > 0) {
                        maxActionsLength = actionArrays.pluck("length").max().value();
                    } else {
                        maxActionsLength = 0;
                    }

                    $scope.hasActions = maxActionsLength > 0;
                    $scope.collapseActions = maxActionsLength > 1;

                    $scope.extraTableClasses = "";
                    var defaultActions = _(rows).pluck("defaultAction").without(undefined);
                    if (defaultActions.size() > 0) {
                        $scope.extraTableClasses += "table-hover";
                    }

                });

                $scope.switchGridMode = function () {
                    if ($scope.$parent.data === undefined) {
                        $scope.$parent.data = {};
                    }
                    $scope.$parent.data.gridMode = $scope.gridMode ? false : true;
                };

                $scope.$watch('gridModeString', function (gridModeString) {
                    //Because we want gridMode to be bound to a literal it will *always* arrive as a string from the template
                    //  that included this directive.  Therefore we need to convert it to a boolean to make it easier to use
                    //  inside this directive.

                    //Due to the one-way binding, gridModeString will change whenever the $parent $scope's gridMode changes
                    // and thus whenever switchGridMode() happens
                    //We must update the local $scope's gridMode to match, or the template will never switch to rendering
                    //  the grid!
                    $scope.gridMode = $scope.gridModeString === "true";
                });
            };

            // Group some of the properties into objects, e.g. table.headings, table.rows, etc
            return {
                restrict: "E",
                templateUrl: "partials/spectrum-table.html",
                scope: {
                    id: "@",
                    addActions: "=",
                    addActionsTitle: "@",
                    headings: "=",
                    rows: "=",
                    emptyMessage: "@",
                    popoverRules: "=",
                    orderableColumns: "@",
                    orderReverseInitial: "@",
                    orderByInitial: "@",
                    gridModeString: "@gridMode",
                    gridModeSelectable: "@",
                    gridStyle: "@",
                    gridColourColumn: "@",
                    gridPictureColumn: "@",
                    gridStatusIconColumn: "@",
                    gridTextColumn: "@",
                    filterable: "@",
                    filterableColumns: "=",
                    filterPrompt: "@",
                    filterApplied: "=",
                    updateInProgress: "=",
                    rowDescriptionPlural: "@",
                    isSelectorTable: "@",
                    doubleClickFunction: "=",
                    updateActionButtons: "=",
                    pictureColumns: "=",
                    checkableColumns: "=",
                    imageColumns: "=",
                    elementsTotalLength: '=',
                    sortItems: '=',
                    pageChanged: '='
                },
                link: link
            };
        }]);
})();
