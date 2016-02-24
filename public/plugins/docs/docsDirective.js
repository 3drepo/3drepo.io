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
				onSetContentHeight: "&",
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
			currentOpenDocType = null;

		vm.showDocsGetProgress = false;
		vm.showInfo = true;
		vm.info = "No object currently selected";

		function getObjectsDocs (object) {
			if (vm.show) {
				vm.docs = [];
				vm.showInfo = false;
				vm.progressInfo = "Loading documents for " + object.name;
				vm.showDocsGetProgress = true;
				promise = DocsService.getDocs(object.id);
				//promise = DocsService.getDocs("55d6ae0c-5d62-4fe7-8bd5-5c84fb90df1c");
				promise.then(function (data) {
					var docType;
					console.log(data);
					vm.showDocsGetProgress = false;
					vm.docs = data;
					vm.showInfo = (Object.keys(vm.docs).length === 0);
					if (vm.showInfo) {
						vm.info = "No documents exist for object: " + object.name;
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
						//vm.onSetContentHeight({height: allDocTypesHeight});
						vm.onContentHeightRequest({height: allDocTypesHeight});
					}
				});
			}
		}

		$scope.$watch(EventService.currentEvent, function (newValue) {
			if (newValue.type === EventService.EVENT.OBJECT_SELECTED) {
				getObjectsDocs(newValue.value);
			}
		});

		vm.showDoc = function (doc) {
			$scope.pdfUrl = doc.url;
			vm.progressInfo = "Loading document " + doc.name;
			vm.showDocLoadProgress = true;
			$mdDialog.show({
				controller: docsDialogController,
				templateUrl: 'docsDialog.html',
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose:true,
				fullscreen: true,
				scope: $scope,
				preserveScope: true,
				onRemoving: removeDialog
			});
		};

		$scope.closeDialog = function() {
			$mdDialog.cancel();
		};

		function removeDialog () {
			$scope.closeDialog();
		}

		function docsDialogController($scope) {
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
				vm.onSetContentHeight({height: allDocTypesHeight});
			}
			else {
				if (currentOpenDocType === "Meta Data") {
					itemsHeight = Object.keys(vm.docs[currentOpenDocType].data[0].metadata).length * metaDataItemHeight;
				}
				//vm.onSetContentHeight({height: allDocTypesHeight + itemsHeight});
				vm.onContentHeightRequest({height: allDocTypesHeight + itemsHeight});
			}
		};

		$(document).on("objectSelected", function(event, objectData) {
			console.log(objectData);
			var object = [];
			if (angular.isDefined(objectData)) {
				object = objectData.id.split("__");
				getObjectsDocs({id: object[object.length - 1], name: object[object.length - 2]});
			}
			else {
				vm.docs = [];
				vm.showInfo = true;
				vm.info = "No object currently selected";
			}
		});
	}
}());
