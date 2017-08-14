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
		.component("docs", {
			restrict: "EA",
			templateUrl: "templates/docs.html",
			bindings: {
				show: "=",
				onContentHeightRequest: "&",
				treeMap: "="
			},
			controller: DocsCtrl,
			controllerAs: "vm"
			
		});

	DocsCtrl.$inject = ["$scope", "$mdDialog", "$timeout", "$filter", "EventService", "DocsService"];

	function DocsCtrl($scope, $mdDialog, $timeout, $filter, EventService, DocsService) {	

		// TODO: What does this component even do? I am confused

		var vm = this,
			promise,
			docTypeHeight = 50,
			allDocTypesHeight,
			currentOpenDocTypes = [],
			autoMetaData,
			pinMode;

		/*
		 * Init
		 */
		vm.$onInit = function() {
			vm.showDocsGetProgress = false;
			vm.onContentHeightRequest({height: 80});
		};

		vm.handleObjectSelected = function(event) {
			// Get any documents associated with an object
			var object = event.value;

			var metadataIds = vm.treeMap.oIdToMetaId[object.id];
			if(metadataIds && metadataIds.length){
				DocsService.getDocs(object.account, object.model, metadataIds[0])
					.then(function(data){

						if(!data){
							return;
						}
						
						vm.show = true;
						
						$timeout(function(){
							//TODO: Do we need to do this for all docs
							// if  we don't support PDFs anymore?
							vm.docs = data;
							allDocTypesHeight = 0;
							// Open all doc types initially
							for (var docType in vm.docs) {
								if (vm.docs.hasOwnProperty(docType)) {
									vm.docs[docType].show = true;
									allDocTypesHeight += docTypeHeight;
								}
							}
							setContentHeight();
						});
					
					});

			} else {
				vm.show = false;
			}
		};

		/*
		 * Set up event watching
		 */
		$scope.$watch(EventService.currentEvent, function (event) {

			var valid = autoMetaData && !pinMode;
			if (
				valid && 
				event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED
			) {

				vm.handleObjectSelected(event);

			} else if (event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {

				vm.show = false;

			} else if (event.type === EventService.EVENT.AUTO_META_DATA) {

				autoMetaData = event.value;

				// Hide or show depending if it's closed or open
				vm.show = false;


			} else if (event.type === EventService.EVENT.PIN_DROP_MODE) {

				pinMode = event.value;

			}
		});

		// vm.prettyDates = function(docType) {
			
		// 	// Pretty format Meta Data dates, e.g. 1900-12-31T23:59:59
		// 	if (docType === "Meta Data") {
		// 		for (var i = 0, length = vm.docs["Meta Data"].data.length; i < length; i += 1) {
		// 			for (var item in vm.docs["Meta Data"].data[i].metadata) {
		// 				if (vm.docs["Meta Data"].data[i].metadata.hasOwnProperty(item)) {
		// 					if (Date.parse(vm.docs["Meta Data"].data[i].metadata[item]) &&
		// 						(typeof vm.docs["Meta Data"].data[i].metadata[item] === "string") &&
		// 						(vm.docs["Meta Data"].data[i].metadata[item].indexOf("T") !== -1)) {
		// 						vm.docs["Meta Data"].data[i].metadata[item] =
		// 							$filter("prettyDate")(new Date(vm.docs["Meta Data"].data[i].metadata[item]), {showSeconds: true});
		// 					}
		// 				}
		// 			}
		// 		}
		// 	}

		// };

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
				templateUrl: "templates/docs-dialog.html",
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
