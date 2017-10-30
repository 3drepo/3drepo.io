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
			},
			controller: DocsCtrl,
			controllerAs: "vm"
			
		});

	DocsCtrl.$inject = [
		"$scope", "$mdDialog", "$timeout", "$filter", 
		"EventService", "DocsService"
	];

	function DocsCtrl(
		$scope, $mdDialog, $timeout, $filter, 
		EventService, DocsService
	) {	

		var vm = this;

		/*
		 * Init
		 */
		vm.$onInit = function() {
			DocsService.docTypeHeight = 50;
			vm.showDocsGetProgress = false;
			vm.onContentHeightRequest({height: 80});
			vm.state = DocsService.state;
		};

		vm.$onDestroy = function() {
			DocsService.state.active = false;
			DocsService.state.show = false;
		};

		$scope.$watch(function(){
			return DocsService.state;
		}, function(){

			if (DocsService.state.updated === true) {
				vm.docs = DocsService.state.docs;
				vm.allDocTypesHeight = DocsService.state.allDocTypesHeight;
				DocsService.state.updated = false;
				setContentHeight();
			}

			if (vm.show !== DocsService.state.show) {
				vm.show = DocsService.state.show;
			}

		}, true);

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
				controller: function(){},
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
				contentHeight += DocsService.docTypeHeight;
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
