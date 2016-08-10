(function() {
    "use strict";

    var commentModelModule = angular.module("widgetRestCommentModelModule", ["restangular"]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Configuration & Initialisation
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    commentModelModule
    .config(["RestangularProvider", function(RestangularProvider) {
        setupDefaultRestangularUrlModifications(RestangularProvider);
    }]);

 commentModelModule
    .factory("widgetCommentService", ["$q", "$timeout", "Restangular", "$sce",
        function($q, $timeout, Restangular, $sce) {
            var parseUrl = function(url) {
                var anchorElement = document.createElement('a');
                anchorElement.href = url;
                return anchorElement;
            };

            var urlRegex = /^https?:\/\/|^\/\//i;

            var isRelative = function(url) {
                return !urlRegex.test(url);
            }

            var changeToAbsoluteImages = function(hostUrl, commentElement) {
                var imageElements = commentElement.find("img");

                imageElements.each(function() {
                    var imageElement = $(this);
                    var srcAttribute = imageElement.attr("src");

                    if (!_.isUndefined(srcAttribute) && isRelative(srcAttribute) && srcAttribute.startsWith('/')) {
                        imageElement.attr("src", hostUrl + srcAttribute);
                    }
                });
            }

            var processAnchors = function(hostUrl, commentElement) {
                var anchors = commentElement.find("a");
                anchors.each(function() {
                    var anchorElement = $(this);
                    var hrefAttribute = anchorElement.attr("href");

                    if (!_.isUndefined(hrefAttribute)) {
                        if (hrefAttribute.startsWith('#')) {
                            anchorElement.removeAttr("href");
                        } else {
                            anchorElement.attr("target", "_blank");
                            if (isRelative(hrefAttribute) && hrefAttribute.startsWith('/')) {
                                anchorElement.attr("href", hostUrl + hrefAttribute);
                            }
                        }
                    }
                });
            }

            var decorateComment = function(appUrl, comment) {
                try {
                    var commentElement = $('<div>').append($.parseHTML(comment.renderedBody));
                } catch(err) {
                    // we can ignore the error an pass the renderBody in the next steps
                }
                var prettyComment;
                if (_.isEmpty(commentElement)) {
                    // cannot be parsed, let it as it is
                    prettyComment = comment.renderedBody;
                } else {
                    var parsedUrl = parseUrl(appUrl);
                    var hostUrl = parsedUrl.protocol + '//' + parsedUrl.host;

                    processAnchors(hostUrl, commentElement);
                    changeToAbsoluteImages(hostUrl, commentElement);

                    prettyComment = $sce.trustAsHtml(commentElement.html());
                    // cleaning up
                    commentElement.remove();
                }
                return {
                     body: prettyComment,
                     creator: {
                        avatar: comment.author.avatarUrls["16x16"],
                        name: comment.author.displayName,
                     },
                     created: moment(comment.created).fromNow()
                };
            }
			var scrollComments = function(widget) {
	            $timeout(function() {
	                var commentsDiv = $('#spec-all-comments-' + widget.wid);
	                commentsDiv.scrollTop(commentsDiv.prop('scrollHeight'));
	            });
	        }

			var service = {
				getCommentsModel: function(appId, ItemKey, appType, appUrl){
					var comments = {};
					comments.appId = appId;
					comments.appType = appType;
					comments.appUrl = appUrl;
					comments.ItemKey = ItemKey;
					comments.ready = false;
					var issueComments = [];
					var promises = [];
					promises.push(
						Restangular.all("message").post({
                            type: appType,
                            method: "canUserAddComments",
                            appId:appId,
                            payload: {
                                issueKey:ItemKey
                            },
	                    }).then(
	                        function (message) {
		                        var permissions = JSON.parse(message.payload);
		                        if (permissions) {
			                        comments.haveAddPermission = permissions.addComments && permissions.addComments.havePermission;
			                        comments.haveBrowseUserPermission = permissions.browseUsers && permissions.browseUsers.havePermission;
		                        }
	                    }));

					// the promise can be used whenewher we want to listen to model update finish
					promises.push(
						Restangular.all("message").post({
							type: appType,
							method: "getComments",
							appId:appId,
							payload: {
							issueKey:ItemKey
							},
							}).then(
							function (message) {
								var responseComments = JSON.parse(message.payload).comments;
								_.forEach(responseComments, function (eachComment) {
									issueComments.push(decorateComment(appUrl, eachComment));
								});
								comments.ready = true;
							}, function() {
								comments.ready = true;
							}));
					comments.promise = $q.all(promises);
					comments.allComments = issueComments;
					return comments;
				},
				decorateComment: function(appUrl, comment) {
					return decorateComment(appUrl, comment);
				},
				postComment: function (appId, itemKey, newComment, appType){
					return Restangular.all("message").post({
							type: appType,
							method: "addComment",
							appId: appId,
							payload: {
								issueKey: itemKey,
								comment: newComment
							},
					});
				},

				getUsers: function(appId, itemKey, searchString) {
					return Restangular.all("message").post({
                            type: "jira",
                            method: "findUsersWithBrowsePermissions",
                            appId: appId,
                            payload: {
                                username: searchString,
                                issueKey: itemKey
                            },
                    });
				},

				showModal: function(comments, widget) {
					var commentsModalElement = $("#comments-modal-" + widget.wid);
					if(!commentsModalElement.hasClass('in')) {
						commentsModalElement.off('shown.bs.modal').on('shown.bs.modal', function() {
							comments.promise.then(function() {
								commentsModalElement.off('shown.bs.modal');
								scrollComments(widget);
							});
						});
						commentsModalElement.modal("show");
					} else {
						comments.promise.then(function() {
							scrollComments(widget);
						});
					}
				},
    			scrollComments: function(widget) {
    				scrollComments(widget);
    			}
			};

			return service;
        }
    ]);
})();
