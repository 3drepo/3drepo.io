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
				height: "=",
				show: "="
			},
			controller: DocsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	DocsCtrl.$inject = ["$scope", "$mdDialog", "EventService", "DocsService"];

	function DocsCtrl($scope, $mdDialog, EventService, DocsService) {
		var vm = this,
			promise;

		vm.showDocsGetProgress = false;
		vm.showDocsLoadInfo = false;

		function getObjectsDocs (object) {
			if (vm.show) {
				vm.docs = [];
				vm.showDocsLoadInfo = false;
				vm.progressInfo = "Loading documents for " + object.name;
				vm.showDocsGetProgress = true;
				promise = DocsService.getDocs(object.id);
				//promise = DocsService.getDocs("55d6ae0c-5d62-4fe7-8bd5-5c84fb90df1c");
				promise.then(function (data) {
					vm.docs = data.meta;
					vm.showDocsGetProgress = false;
					vm.showDocsLoadInfo = (vm.docs.length === 0);
					if (vm.showDocsLoadInfo) {
						vm.docsLoadInfo = "No documents exist for " + object.name;
					}
				});
			}
		}

		$scope.$watch(EventService.currentEvent, function (newValue) {
			if (newValue.type === EventService.EVENT.OBJECT_SELECTED) {
				getObjectsDocs(newValue.value);
				/*
				vm.docs = [];
				vm.showDocsLoadInfo = false;
				vm.progressInfo = "Loading documents for " + newValue.value.name;
				vm.showDocsGetProgress = true;
				promise = DocsService.getDocs(newValue.value.id);
				//promise = DocsService.getDocs("55d6ae0c-5d62-4fe7-8bd5-5c84fb90df1c");
				promise.then(function (data) {
					vm.docs = data.meta;
					vm.showDocsGetProgress = false;
					vm.showDocsLoadInfo = (vm.docs.length === 0);
					if (vm.showDocsLoadInfo) {
						vm.docsLoadInfo = "No documents exist for " + newValue.value.name;
					}
				});
				*/
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

		$(document).on("objectSelected", function(event, objectData) {
			var object = [];
			if (angular.isDefined(objectData)) {
				object = objectData.id.split("__");
				getObjectsDocs({id: object[object.length - 1], name: object[object.length - 2]});
			}
			else {
				vm.docs = [];
				vm.showDocsLoadInfo = false;
			}
		});
	}
}());
