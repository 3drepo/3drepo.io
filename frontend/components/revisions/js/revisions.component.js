(function () {
	"use strict";

	angular.module("3drepo")
		.component("revisions", {
			restrict: "E",
			templateUrl: "templates/revisions.html",
			bindings: {
				account: "=",
				model: "=",
				revision: "=",
				modelName: "="
			},
			controller: revisionsCtrl,
			controllerAs: "vm"
		});

	revisionsCtrl.$inject = ["DialogService", "$location", "$scope", "RevisionsService", "APIService", "$filter"];

	function revisionsCtrl (DialogService, $location, $scope, RevisionsService, APIService, $filter) {
		var vm = this;

		vm.$onInit = function(){
			vm.revisionsLoading = true;
		};

		$scope.$watch(function(){
			return RevisionsService.status.ready;
		}, function(){

			if (RevisionsService.status.ready === true) {

				vm.revisions = RevisionsService.status.data;
				vm.revisionsLoading = false;

				if(!vm.revisions || !vm.revisions[0]){
					return;
				}
	
				if(!vm.revision) {

					vm.revName = vm.revisions[0].tag || $filter("revisionDate")(vm.revisions[0].timestamp);
					vm.revisions[0].current = true;
	
				} else {

					vm.revisions.forEach(function(rev, i){

						if (rev.tag === vm.revision){
							vm.revName = vm.revision;
							vm.revisions[i].current = true;
						} else if (rev._id === vm.revision){
							vm.revName = $filter("revisionDate")(rev.timestamp);
							vm.revisions[i].current = true;
						}

					});

				}

				RevisionsService.status.ready = false;

			} 
			
		}, true);

		vm.openDialog = function(event){

			vm.revisions = [];
			vm.revisionsLoading = true;

			RevisionsService.listAll(vm.account, vm.model).then(function(revisions){
				vm.revisionsLoading = false;
				vm.revisions = revisions;
			});
			
			DialogService.showDialog("revisions-dialog.html", $scope, event, true);
		};

		/**
		* Go to the specified revision
		*/
		vm.goToRevision = function(revId){
			vm.revision = revId;
			DialogService.closeDialog();
			$location.path("/" + vm.account + "/" + vm.model + "/" + revId , "_self");

		};

		vm.closeDialog = function() {
			DialogService.closeDialog();
		};

	}


}());
