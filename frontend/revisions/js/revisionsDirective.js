(function () {
	"use strict";

	angular.module("3drepo")
		.directive("revisions", revisions);

	function revisions () {
		return {
			restrict: 'E',
			templateUrl: 'revisions.html',
			scope: {
				account: "=",
				project: "=",
				revision: "=",
			},
			controller: revisionsCtrl,
			controllerAs: 'vm',
			bindToController: true,
		};
	}

	revisionsCtrl.$inject = ["$location", "$scope", "RevisionsService", "UtilsService"];

	function revisionsCtrl ($location, $scope, RevisionsService, UtilsService) {
		var vm = this;
		vm.revName = vm.revision || 'head';
		//$scope.$apply();


		vm.openDialog = function(){

			if(!vm.revisions){
				RevisionsService.listAll(vm.account, vm.project).then(function(revisions){
					vm.revisions = revisions;
				});
			}

			UtilsService.showDialog("revisionsDialog.html", $scope, event, true);
		}

		/**
		* Go to the specified revision
		*/
		vm.goToVision = function(revId){
			$location.path("/" + vm.account + "/" + vm.project + "/" + revId , "_self");
		}

		vm.closeDialog = function() {
			UtilsService.closeDialog();
		};

	}


}());
