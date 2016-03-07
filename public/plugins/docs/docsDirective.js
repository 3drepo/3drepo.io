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

	DocsCtrl.$inject = ["$scope", "$mdDialog", "$timeout", "EventService", "DocsService"];

	function DocsCtrl($scope, $mdDialog, $timeout, EventService, DocsService) {
		var vm = this,
			promise,
			docTypeHeight = 50,
			allDocTypesHeight,
			currentOpenDocType = null,
			eventWatch;

		vm.showDocsGetProgress = false;
		vm.showInfo = true;
		vm.info = "No object currently selected";

		/**
		 * Get any documents associated with an object
		 *
		 * @param object
		 */
		function getObjectsDocs (object) {
			var noDocumentsHeight = 140; // Make it large enough for long object names

			vm.docs = [];
			vm.showInfo = false;
			vm.progressInfo = "Loading documents for " + object.name;
			vm.showDocsGetProgress = true;
			currentOpenDocType = null;
			promise = DocsService.getDocs(object.account, object.project, object.id);
			promise.then(function (data) {
				var docType;
				vm.showDocsGetProgress = false;
				vm.docs = data;
				vm.showInfo = (Object.keys(vm.docs).length === 0);
				if (vm.showInfo) {
					vm.info = "No documents exist for object: " + object.name;
					vm.onContentHeightRequest({height: noDocumentsHeight});
				}
				else {
					allDocTypesHeight = 0;
					// Collapse all doc types initially
					for (docType in vm.docs) {
						if (vm.docs.hasOwnProperty(docType)) {
							vm.docs[docType].show = false;
							allDocTypesHeight += docTypeHeight;
						}
					}
					// Set the content height
					vm.onContentHeightRequest({height: allDocTypesHeight});
				}
			});
		}

		/**
		 * Set up event watching
		 */
		function setupEventWatch () {
			var noObjectSelectedHeight = 80;

			eventWatch = $scope.$watch(EventService.currentEvent, function (event) {
				if (event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED) {
					getObjectsDocs(event.value);
				}
				else if (event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
					vm.docs = [];
					vm.showInfo = true;
					vm.info = "No object currently selected";
					vm.onContentHeightRequest({height: noObjectSelectedHeight});
					currentOpenDocType = null;
				}
			});
		}

		/*
		 * Only watch for events when shown
		 */
		$scope.$watch("vm.show", function (newValue) {
			if (angular.isDefined(newValue)) {
				if (newValue) {
					setupEventWatch();
				}
				else if (angular.isDefined(eventWatch)) {
					eventWatch(); // Cancel event watching
				}
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
		 * Open and close doc types, allowing only one doc type open at a time
		 *
		 * @param docType
		 */
		vm.toggleItem = function (docType) {
			var itemsHeight,
				metaDataItemHeight = 30; // It could be higher for items with long text but ignore that

			if (currentOpenDocType === null) {
				// No doc type is open so open this doc type
				vm.docs[docType].show = true;
				currentOpenDocType = docType;
			}
			else {
				// Close the current doc type
				vm.docs[currentOpenDocType].show = false;
				if (currentOpenDocType === docType) {
					// No doc type currently open
					currentOpenDocType = null;
				}
				else {
					// Open this doc type and set the currently open doc type
					vm.docs[docType].show = true;
					currentOpenDocType = docType;
				}
			}

			// Set the content height
			if (currentOpenDocType === null) {
				// No currently open doc type
				vm.onContentHeightRequest({height: allDocTypesHeight});
			}
			else {
				if (currentOpenDocType === "Meta Data") {
					itemsHeight = Object.keys(vm.docs[currentOpenDocType].data[0].metadata).length * metaDataItemHeight;
				}
				vm.onContentHeightRequest({height: allDocTypesHeight + itemsHeight});
			}
		};
	}
}());
