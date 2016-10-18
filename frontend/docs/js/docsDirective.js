/**
 *	Copyright (C) 2015 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("docs", docs);

	function docs() {
		return {
			restrict: 'EA',
			templateUrl: 'docs.html',
			scope: {
				show: "=",
				onContentHeightRequest: "&"
			},
			controller: DocsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	DocsCtrl.$inject = ["$scope", "$mdDialog", "$timeout", "$filter", "EventService", "DocsService", "UtilsService"];

	function DocsCtrl($scope, $mdDialog, $timeout, $filter, EventService, DocsService, UtilsService) {
		var vm = this,
			promise,
			docTypeHeight = 50,
			allDocTypesHeight,
			currentOpenDocTypes = [],
			autoMetaData;

		/*
		 * Init
		 */
		vm.showDocsGetProgress = false;
		vm.onContentHeightRequest({height: 80});

		/*
		 * Set up event watching
		 */
		$scope.$watch(EventService.currentEvent, function (event) {
			var item, i, length;
			if (autoMetaData && (event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED)) {
				// Get any documents associated with an object
				var object = event.value;
				promise = DocsService.getDocs(object.account, object.project, object.id);
				promise.then(function (data) {
					if (Object.keys(data).length > 0) {
						vm.show = true;
						$timeout(function () {
							vm.docs = data;
							allDocTypesHeight = 0;
							// Open all doc types initially
							for (var docType in vm.docs) {
								if (vm.docs.hasOwnProperty(docType)) {
									vm.docs[docType].show = true;
									allDocTypesHeight += docTypeHeight;

									/*
									// Pretty format Meta Data dates, e.g. 1900-12-31T23:59:59
									if (docType === "Meta Data") {
										for (i = 0, length = vm.docs["Meta Data"].data.length; i < length; i += 1) {
											for (item in vm.docs["Meta Data"].data[i].metadata) {
												if (vm.docs["Meta Data"].data[i].metadata.hasOwnProperty(item)) {
													if (Date.parse(vm.docs["Meta Data"].data[i].metadata[item]) &&
														(typeof vm.docs["Meta Data"].data[i].metadata[item] === "string") &&
														(vm.docs["Meta Data"].data[i].metadata[item].indexOf("T") !== -1)) {
														vm.docs["Meta Data"].data[i].metadata[item] =
															$filter("prettyDate")(new Date(vm.docs["Meta Data"].data[i].metadata[item]), {showSeconds: true});
													}
												}
											}
										}
									}
									 */
								}
							}
							setContentHeight();
						});
					}
					else {
						vm.show = false;
					}
				});
			}
			else if (event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
				vm.show = false;
			}
			else if (event.type === EventService.EVENT.AUTO_META_DATA) {
				autoMetaData = event.value;
			}
		});

		/**
		 * Show a document in a dialog
		 *
		 * @param {Object} doc
		 */
		vm.showDoc = function (doc) {
			$scope.pdfUrl = doc.url;
			vm.progressInfo = "Loading document " + doc.name;
			vm.showDocLoadProgress = true;
			$mdDialog.show({
				controller: docsDialogController,
				templateUrl: "docsDialog.html",
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose:true,
				fullscreen: true,
				scope: $scope,
				preserveScope: true,
				onRemoving: removeDialog
			});
		};

		/**
		 * Close the dialog
		 */
		$scope.closeDialog = function() {
			$mdDialog.cancel();
		};

		/**
		 * Close the dialog by not clicking the close button
		 */
		function removeDialog () {
			$scope.closeDialog();
		}

		function docsDialogController() {
		}

		/**
		 * Open and close doc types
		 *
		 * @param docType
		 */
		vm.toggleItem = function (docType) {
			vm.docs[docType].show = !vm.docs[docType].show;
			setContentHeight();
		};

		/**
		 * Set the height of the content
		 */
		function setContentHeight () {
			var contentHeight = 0,
				itemsHeight,
				metaDataItemHeight = 50; // It could be higher for items with long text but ignore that

			angular.forEach(vm.docs, function(value, key) {
				contentHeight += docTypeHeight;
				if (value.show) {
					if (key === "Meta Data") {
						itemsHeight = Object.keys(value.data[0].metadata).length * metaDataItemHeight;
					}
					contentHeight += itemsHeight;
				}
			});

			vm.onContentHeightRequest({height: contentHeight});
		}
	}
}());
