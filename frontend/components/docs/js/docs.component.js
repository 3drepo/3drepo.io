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

	DocsCtrl.$inject = [
		"$scope", "$mdDialog", "$timeout", "$filter", 
		"EventService", "DocsService", "ViewerService", "TreeService"
	];

	function DocsCtrl(
		$scope, $mdDialog, $timeout, $filter, 
		EventService, DocsService, ViewerService, TreeService
	) {	

		var vm = this;

		/*
		 * Init
		 */
		vm.$onInit = function() {
			vm.docTypeHeight = 50;
			vm.showDocsGetProgress = false;
			vm.onContentHeightRequest({height: 80});
		};

		vm.handleObjectSelected = function(event) {
			// Get any documents associated with an object
			var object = event.value;

			TreeService.getMap().then(function(map)
				{
					var metadataIds = map.oIdToMetaId[object.id];
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
								vm.allDocTypesHeight = 0;
								// Open all doc types initially
								for (var docType in vm.docs) {
									if (vm.docs.hasOwnProperty(docType)) {
										vm.docs[docType].show = true;
										vm.allDocTypesHeight += vm.docTypeHeight;
									}
								}
								setContentHeight();
							});
				
						});
					} else {
							vm.show = false;
					}
				});

		};

		/*
		 * Set up event watching
		 */
		$scope.$watch(EventService.currentEvent, function (event) {

			var valid = vm.autoMetaData && !ViewerService.pin.pinDropMode;
			if (
				valid && 
				event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED
			) {

				vm.handleObjectSelected(event);

			} else if (event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {

				vm.show = false;

			} else if (event.type === EventService.EVENT.AUTO_META_DATA) {

				vm.autoMetaData = event.value;

				// Hide or show depending if it's closed or open
				vm.show = false;


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
				contentHeight += vm.docTypeHeight;
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
