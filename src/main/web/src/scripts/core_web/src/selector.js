/*
 * Note: the selector will work with no issues as long as the row elements have an "id" and a "name" field
 */

(function() {
	"use strict";
	var selectorModule = angular.module("spectrumSelectorModule", []);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Directives
	///////////////////////////////////////////////////////////////////////////////////////////////////
	selectorModule
	.directive("spectrumSelector",
		function() {
			var link = function($scope) {
				$scope.addDisabled = true;
				$scope.removeDisabled = true;

				$scope.displayFields = (function() {
					var fields = [];
					if ($scope.displayOptions) {
						var keys = Object.keys($scope.displayOptions);
						fields = _.map(keys, function(key) {
							var field = {};
							field[key] = key;
							return field;
						});
					} else {
						var field = {};
						field["name"] = "name";
						fields.push(field);
					}
					return fields;
				})();

				$scope.updateButtonState = function() {
					$scope.addDisabled = !_.some($scope.unselectedItems.rows, "isSelected");
					$scope.removeDisabled = !_.some($scope.selectedItems.rows, "isSelected");
				};

				$scope.getIconName = function(item) {
					//This simply to give the item an icon even if its type is null/undefined. 'user' is
					//part of the CSS class name and so this is just a sensible fallback to avoid no icon
					var type = item.type ? item.type.toLowerCase() : "user";
					var icon = "spec-data-" + type;
					icon += item.external ? "-external" : "-internal";
					icon += item.active ? "-active" : "-inactive";
					return icon;
				};

				$scope.itemClicked = function(item) {
					item.isSelected = !item.isSelected;
					$scope.updateButtonState();
				};

				$scope.add = function(highlighted) {
					var highlightedItems = highlighted;
					if (highlightedItems === undefined) {
						highlightedItems = _.filter($scope.unselectedItems.rows, "isSelected");
					}

					highlightedItems.forEach(function(item) {
						var newItem = $scope.unselectedItems.getUndecoratedRow(item.data.id);
						$scope.selectedItems.addRow(newItem);
						$scope.unselectedItems.removeRow(newItem.id);
					});
					$scope.updateButtonState();
				};

				$scope.remove = function(highlighted) {
					var highlightedItems = highlighted;
					if (highlightedItems === undefined) {
						highlightedItems = _.filter($scope.selectedItems.rows, "isSelected");
					}

					highlightedItems.forEach(function(item) {
						var newItem = $scope.selectedItems.getUndecoratedRow(item.data.id);

						$scope.unselectedItems.addRow(newItem);
						$scope.selectedItems.removeRow(newItem.id);
					});
					$scope.updateButtonState();
				};

				$scope.changeAllItemSelection = function(items, itemsAreSelected) {
					if (items) {
						items.forEach(function(item) {
							item = _.assign(item, {isSelected: itemsAreSelected});
						});
						$scope.updateButtonState();
					}
				};

			};

			return {
				restrict: "E",
				templateUrl: "partials/selector.html",
				scope: {
					id: "@",
					unselectedHeading: "@",
					selectedHeading: "@",
					buttonHelp: "@",
					unselectedItems: "=",
					selectedItems: "=",
					visibleHeadings: "=",
					displayOptions: "="
				},
				link: link
			};
		}
	);
})();
