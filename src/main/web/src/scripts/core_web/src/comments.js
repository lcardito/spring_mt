(function () {
  "use strict";
    var spectrumCommentsModule = angular.module("spectrumCommentsModule", ["widgetRestCommentModelModule"]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Directives
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    spectrumCommentsModule
        .directive("spectrumComments", ["widgetCommentService", "$timeout", function (widgetCommentService, $timeout) {
        var link = function($scope, element, attributes){
	        // adds new comments to the jira server
	        $scope.addNewComment = function(comments){
	            delete comments.error;
	            if (!_.isEmpty(comments.newComment) && $scope.comments.haveAddPermission) {
	                comments.submitting = true;
			        widgetCommentService.postComment(comments.appId, comments.ItemKey, comments.newComment, comments.appType)
			        .then
			            (function(response){
			                comments.submitting = false;
			                delete comments.newComment;
			                // first just add the recently added comment
			                var comment = JSON.parse(response.payload);
			                comments.allComments.push(widgetCommentService.decorateComment(comments.appUrl, comment));
			                widgetCommentService.showModal(comments, $scope.widget);

							// now reload all the comments to fetch comments that were added meanwhile
							var commentsModel = widgetCommentService.getCommentsModel(comments.appId, comments.ItemKey, comments.appType, comments.appUrl);
							comments.ready = true;
                            commentsModel.promise.then(function() {
                                // replace allComments only after we have successful results from server
                                comments.allComments = commentsModel.allComments;
                                widgetCommentService.scrollComments($scope.widget);
                            });
			            }, function() {
			                comments.submitting = false;
			                comments.error = "Comment could not be added.";
			            });
	            }
	        }

			var decorateUser = function(user, searchString) {
				var escapeRegExp = function(string){
                  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                }

				var emphasize = function(str) {
					var regexp = new RegExp("(^|[\\s|@|\\.])(" + escapeRegExp(_.escape(searchString)) + ")", "ig");
	                return _.escape(str).replace(regexp, "$1<strong>$2</strong>");
				}
				user.renderedBody = emphasize(user.displayName) + " - " + emphasize(user.emailAddress) + " (" + emphasize(user.name) + ")";
				return user;
			}

	        var showUsers = _.debounce(function() {
	            if ($scope.comments.mentionControl && !_.isEmpty($scope.comments.mentionControl.controlString)) {
	                var searchString = $scope.comments.mentionControl.controlString;
	                widgetCommentService.getUsers($scope.comments.appId, $scope.comments.ItemKey, searchString)
	                .then(function(message) {
	                    // check whether the search results are still relevant
	                    if ($scope.comments.mentionControl && searchString == $scope.comments.mentionControl.controlString) {
							$scope.comments.foundUsers = JSON.parse(message.payload);
							if (!_.isEmpty($scope.comments.foundUsers)) {
								var userIndex = 0;
								if ($scope.comments.selectedUser) {
									userIndex = _.findIndex($scope.comments.foundUsers, function(user) { return $scope.comments.selectedUser.key == user.key });
									if (userIndex < 0) {
										userIndex = 0;
									}
								}
								$scope.comments.selectedUser = $scope.comments.foundUsers[userIndex];
								_.forEach($scope.comments.foundUsers , function (user) {
	                                decorateUser(user, $scope.comments.mentionControl.controlString);
	                            });
							}
						}
	                }, function() {
	                    $scope.comments.error = "Users could not be loaded.";
	                    clearMentions();
	                });
	            }
	        }, 250);

	        var findControl = function(comment, target) {
	            if (angular.isUndefined(comment)) {
	                return;
	            }
	            var caretPosition = getCaretPosition(target);
	            var controlString;
	            if (!angular.isUndefined(caretPosition)) {
	                controlString = comment.substring(0, caretPosition);
	            }

	            var match = (/(\[~|@)([^(?:\[~)@\r\n]*)$/g).exec(controlString);
	            if (match) {
	                return {
                        "type" : match[1],
                        "index" : match.index,
                        "controlString" : match[2].trim(),
                        "caretPosition" : caretPosition
                    };
	            }
	        }

	        var getCaretPosition = function(element) {
	            var caretPosition = 0;

	            if (document.selection) {
	                // IE
	                element.focus();
	                element.focus();
	                var selection = document.selection.createRange();
	                selection.moveStart('character', -element.value.length);
	                caretPosition = selection.text.length;
	            } else if (element.selectionStart || element.selectionStart == '0') {
	                // Firefox
	                caretPosition = element.selectionStart;
	            }

	            return caretPosition;
	        }

	        var setCaretPosition = function(element, caretPosition) {
	            if (element.createTextRange) {
	                var range = element.createTextRange();
	                range.move('character', caretPosition);
	                range.select();
	            } else {
	                if (element.setSelectionRange) {
	                    element.focus();
	                    element.setSelectionRange(caretPosition, caretPosition);
	                } else {
	                    element.focus();
	                }
	            }
	        }

	        var clearMentions = function() {
	            delete $scope.comments.foundUsers;
	            delete $scope.comments.mentionControl;
	            delete $scope.comments.selectedUser;
	        }

	        $scope.checkMentions = function($event) {
	            delete $scope.comments.error;
				if ($scope.comments.newComment !== undefined && $scope.comments.newComment !== null && $scope.comments.haveBrowseUserPermission) {
		            var comment = $scope.comments.newComment;
		            var control = findControl(comment, $event.target);
		            var previousControl = $scope.comments.mentionControl;
		            if (control) {
		                if (previousControl
		                    && control.type == previousControl.type
		                    && control.index == previousControl.index
		                    && control.caretPosition == previousControl.caretPosition
		                    && control.controlString == previousControl.controlString) {
		                    return;
		                }

						// ignore if it is already closed mention tag withing the search string
                        if (control.type == "[~" && control.controlString.indexOf("]") > -1) {
                           clearMentions();
                           return;
                        }

						$scope.comments.mentionControl = control;

		                // don't check mention if the search string is longer than 20 characters or contains more than 3 words
		                if (control.controlString.length > 20 || control.controlString.split(/\s+/, 4).length > 3) {
		                    $scope.comments.mentionControl.cancelled = true;
		                }

                        if (previousControl) {
                            var previousNoResultsControlString = previousControl.firstNoResultsControlString;
                            if (!previousNoResultsControlString && $scope.comments.foundUsers && $scope.comments.foundUsers.length == 0) {
                                previousNoResultsControlString = previousControl.controlString;
                            }
                            if (previousNoResultsControlString) {
                                if (control.controlString.startsWith(previousNoResultsControlString)) {
	                                // if we have no results for substring, we don't have to fetch results for longer string and display not found message
                                    $scope.comments.mentionControl.firstNoResultsControlString = previousNoResultsControlString;
                                    if (control.controlString === previousNoResultsControlString) {
                                        // even if foundUsers is deleted, we know that it must be empty
                                        $scope.comments.foundUsers = [];
                                    } else {
                                        $scope.comments.mentionControl.cancelled = true;
	                                }
	                                return;
                                } else {
                                    delete $scope.comments.foundUsers;
                                }
                            }
                        }
		            } else {
		                delete($scope.comments.mentionControl);
		            }

		            if (!$scope.comments.mentionControl || _.isEmpty($scope.comments.mentionControl.controlString)) {
		                clearMentions();
		            } else {
		                showUsers();
		            }
	            }
	        }

	        $scope.onFocus = function($event) {
	            delete $scope.comments.error;
	            $timeout(function() {
	                $scope.checkMentions($event);
	            });
	        }

	        var selectUser = function(target, user) {
	            var control = $scope.comments.mentionControl;
	            if (control) {
	                $scope.comments.newComment = $scope.comments.newComment.substring(0, control.index) + '[~' + user.name + ']'
	                                                                                    + $scope.comments.newComment.substring(control.caretPosition);

	                var position = control.index + user.name.length + 3;
	                $timeout(function() {
	                    setCaretPosition(target, position);
	                });
	                clearMentions();
	            }
	        }

	        $scope.onBlur = function($event) {
	            delete $scope.comments.error;
	            if ($scope.comments.mentionControl) {
                    $scope.comments.mentionControl.cancelled = true;
                }
	        }

	        $scope.selectUser = function(user) {
	            var target = element.find('textarea');
	            selectUser(target, user);
	        }

	        $scope.processKeypress = function($event) {
	            if ($event.keyCode == 13 && !angular.isUndefined($scope.comments.foundUsers) && $scope.comments.foundUsers.length > 0) {
	                // enter pressed
	                var selectedUser = $scope.comments.selectedUser || $scope.comments.foundUsers[0];
	                selectUser($event.target, selectedUser);
	                $event.preventDefault();
	            } else if ($event.keyCode == 38) {
	                // up pressed
	                var foundUsers = $scope.comments.foundUsers;
	                if (foundUsers) {
	                    if ($scope.comments.selectedUser) {
	                        var currentUserIndex = _.findIndex(foundUsers, function(user) { return $scope.comments.selectedUser.key == user.key });
	                        currentUserIndex = currentUserIndex - 1;
	                        if (currentUserIndex < 0) {
	                            currentUserIndex = foundUsers.length - 1;
	                        }
	                        $scope.comments.selectedUser = foundUsers[currentUserIndex];
	                    } else {
	                        $scope.comments.selectedUser = foundUsers[foundUsers.length - 1];
	                    }
	                    $event.preventDefault();
	                }
	            } else if ($event.keyCode == 40) {
	                // down pressed
	                var foundUsers = $scope.comments.foundUsers;
	                if (foundUsers) {
	                    if ($scope.comments.selectedUser) {
	                        var currentUserIndex = _.findIndex(foundUsers, function(user) { return $scope.comments.selectedUser.key == user.key });
	                        currentUserIndex = currentUserIndex + 1;
	                        if (currentUserIndex >= foundUsers.length) {
	                            currentUserIndex = 0;
	                        }
	                        $scope.comments.selectedUser = foundUsers[currentUserIndex];
	                    } else {
	                        $scope.comments.selectedUser = foundUsers[0];
	                    }
	                    $event.preventDefault();
	                }
	            } else if ($event.keyCode == 27) {
	                // esc pressed
	                if ($scope.comments.foundUsers) {
	                    delete($scope.comments.foundUsers);
	                    delete($scope.comments.selectedUser);
	                    if ($scope.comments.mentionControl) {
	                        $scope.comments.mentionControl.cancelled = true;
	                    }
	                    $event.stopPropagation();
	                    $event.preventDefault();
	                }
	            }
	        }


        };
		return {
			restrict: "E",
			templateUrl: "partials/spectrum-comments.html",
			scope: {
				id: "@",
				comments: "=",
				widget: "="
			},
			link: link
		}

    }]);

})();
