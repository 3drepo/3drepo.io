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

	revisionsCtrl.$inject = ["$location", "$scope", "RevisionsService", "UtilsService", "$filter"];

	function revisionsCtrl ($location, $scope, RevisionsService, UtilsService, $filter) {
		var vm = this;

		RevisionsService.listAll(vm.account, vm.project).then(function(revisions){
			vm.revisions = revisions;
		});

		$scope.$watch("vm.revisions", function () {
			
			if(!vm.revision){
				vm.revName = vm.revisions[0].tag || $filter('revisionDate')(vm.revisions[0].timestamp);
				vm.revisions[0].current = true;

			} else {
				vm.revisions && vm.revisions.forEach(function(rev, i){
					if(rev.tag === vm.revision){
						vm.revName = vm.revision;
						vm.revisions[i].current = true;
					} else if(rev._id === vm.revision){
						vm.revName = $filter('revisionDate')(rev.timestamp);
						vm.revisions[i].current = true;

					}
				});
			}

		});

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
		vm.goToRevision = function(revId){

			UtilsService.closeDialog();
			$location.path("/" + vm.account + "/" + vm.project + "/" + revId , "_self");

		}

		vm.closeDialog = function() {
			UtilsService.closeDialog();
		};

	}


}());
