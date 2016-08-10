var blankImage = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
"use strict";

var bookmarkModule = angular.module("adf.widget.bookmark", ["adf.provider", "spectrumUtilitiesModule"]);

///////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration of custom ADF templates
///////////////////////////////////////////////////////////////////////////////////////////////////
setupWidgetTweaks(angular);

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Configuration & Initialisation
	///////////////////////////////////////////////////////////////////////////////////////////////////
	bookmarkModule.config(["RestangularProvider", "dashboardProvider", function(RestangularProvider, dashboardProvider) {
		setupDefaultRestangularUrlModifications(RestangularProvider);
		dashboardProvider.widget("bookmarks", {
            title: "Bookmarks",
            class: "",
            colour: "",
            description: "Save Bookmarks/Links",
            templateUrl: "partials/widgets/bookmark.html",
            controller: "bookmarksController",
        });
	}]).createErrorHandler = spectrumRestangularErrorHandler;

	bookmarkModule.controller("bookmarksController", ["$q", "$scope", "widget", "Restangular", "arrayTableModelService", "saveWidgetConfig",
			"MINICOLORS_SETTINGS", "TITLE_BAR_COLORS",
		function ($q, $scope, widget, Restangular, arrayTableModelService, saveWidgetConfig,
		MINICOLORS_SETTINGS, TITLE_BAR_COLORS) {
			$scope.bookmarkToSave = [];
			$scope.bookmarkToDelete = [];
			$scope.ready = false;

			$scope.widget = widget;
			toggleWidgetResize(widget);
			$scope.widget.searchBox = false;
			$scope.data = _.extend(getStandardWidgetData($scope, MINICOLORS_SETTINGS, TITLE_BAR_COLORS), {
                            showRefreshOptions: false,
                        });
			$scope.$watch("resultTable.updateInProgress", function (newVal, oldVal) {
				if (oldVal && !newVal) {
					$scope.ready = true;
				}
			});
			$scope.$watch("data.titleBgColor", function (newVal, oldVal) {
				$scope.widget.bgColor = newVal;
			});
			$scope.$watch("data.titleTxtColor", function (newVal, oldVal) {
				$scope.widget.txtColor = newVal;
			});

			$scope.update = function (withSave) {
				$scope.ready = false;
				delete $scope.resultTable; // remove all elements from the table
				Restangular.all("message").post({
					type: "bookmarks",
					method: "getBookmarks",
					appId: null
				}).then(
				function (message) {
					var results = JSON.parse(message.payload);
					$scope.resultTable = arrayTableModelService.createArrayTableModel(results,
					function(bookmark) {
						return {data: bookmark,url: bookmark.link, defaultAction: [], external: true}
					}, false, ["link", "label"]);
				}, function() { $scope.ready = true });
			};

			$scope.changeButtonColor = function(){
				document.getElementById("spec-widget-bookmark-add-" + $scope.widget.wid).className = "btn btn-primary";
			};

			$scope.saveOptions = function(form) {
				$scope.ready = false;
				$scope.updateBookmarks($scope.bookmarkToSave).then(function(){
					$scope.bookmarkToSave = [];
					$scope.bookmarkToDelete = [];
					standardSaveOptions($scope, saveWidgetConfig, form.$valid);
				}, function() { $scope.ready = true });
			};

			$scope.updateBookmarks = function(){

				var promises = [];

				if($scope.bookmarkToSave.length !== 0){
					_.forEach($scope.bookmarkToSave, function (bookmark) {
						promises.push(Restangular.all("message").post({
							type: "bookmarks",
							method: "addBookmark",
							appId: null,
							payload:{
								link:bookmark.link,
								label:bookmark.label
							}
						}))
					});
				}

				// delete Bookmark
				if($scope.bookmarkToDelete.length !== 0){
					_.forEach($scope.bookmarkToDelete, function (bookmark) {
						promises.push(
							Restangular.all("message").post({
								type: "bookmarks",
								method: "removeBookmark",
								appId: null,
								payload:bookmark
							})
						);
					});
				}
				hideWidgetOptions($scope);
				if (promises.length > 0) {
					return $q.all(promises);
				} else {
					return $q.when();
				}
			};

			$scope.removeBookmark = function(bookmark){
				var newBookmark = {
					id: bookmark.data.id
				};
				$scope.bookmarkToDelete.push(newBookmark);
				_.remove($scope.resultTable.rows, function(n) {
					return ((n.data.label === bookmark.data.label)&&
							(n.data.link === bookmark.data.link));
				});
				// delete it from the addBookMark buffer
				_.remove($scope.bookmarkToSave, function(n) {
					return ((n.label === bookmark.data.label)&&
							(n.link === bookmark.data.link));
				});
			};

			$scope.addBookmark = function(form){
				var newBookmark  =  $scope.data.bookmark;
				if(form.$valid && typeof newBookmark != "undefined"){
					if($scope.checkBookmarkForm(form)){
						var newBookmark = {
							label: newBookmark.label,
							link: newBookmark.link
						};
						$scope.bookmarkToSave.push(newBookmark);
						// so it shows up on the table
						$scope.resultTable.rows.push({
							data: newBookmark,
							url: $scope.data.bookmark.link,
							external: true
						});
						document.getElementById("spec-widget-bookmark-add-" + $scope.widget.wid).className = "btn btn-success";
						$scope.data.bookmark.label = "";
						$scope.data.bookmark.link = "";
						document.getElementById("spec-widget-bookmark-add-" + $scope.widget.wid).focus();
					}
				}else{
					$scope.data.formErrors = true;
					$scope.data.formErrors = "Enter Valid Label or URL";
				}
			};

			$scope.cancelConfigOption = function(){
				$scope.bookmarkToSave = [];
				$scope.bookmarkToDelete = [];
				cancelOptions($scope);
			};

			$scope.checkBookmarkForm = function (){
				$scope.data.bookmarkLinkError = false;
				$scope.data.formErrors = false;
				var newBookmark = $scope.data.bookmark;
				if(typeof newBookmark.label == "undefined" || newBookmark.label.trim().length === 0 ){
					$scope.data.formErrors = true;
					$scope.data.formErrors = "Enter Valid Label"
					return false;
				}
				var labelIndex = _.findIndex($scope.resultTable.rows, function(n) {
					return n.data.label === newBookmark.label;
				});

				if(labelIndex != -1){
					$scope.data.formErrors = true;
					$scope.data.formErrors = "Enter Unique Label"
					return false;
				}
				var urlRegex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

				if(!urlRegex.test(newBookmark.link)){
					$scope.data.bookmarkLinkError = true;
					return false;
				}

				return true;
			};

			setupWidgetOptionFunctions($scope);
			$scope.update(false);
		}
	]);

