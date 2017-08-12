/**
 *	Copyright (C) 2016 3D Repo Ltd
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
		.component("accountInfo", {
			restrict: "E",
			templateUrl: "templates/account-info.html",
			bindings: {
				username: "=",
				firstName: "=",
				lastName: "=",
				email: "=",
				itemToShow: "=",
				hasAvatar: "=",
				loading: "="
			},
			controller: AccountInfoCtrl,
			controllerAs: "vm"
		});

	AccountInfoCtrl.$inject = ["$location", "$scope", "$element", "ClientConfigService", "UtilsService"];

	function AccountInfoCtrl ($location, $scope, $element, ClientConfigService, UtilsService) {
		var vm = this;
		
		/*
		 * Init
		 */
		vm.$onInit = function() {
			vm.accountOptions = {
				teamspaces: {label: "Teamspaces"},
				profile: {label: "Profile"},
				billing: {label: "Billing"},
				licenses: {label: "Licenses"},
				assign: {label: "Assign Permissons" }
			};
			vm.imageLoaded = false;
			vm.registerUrlCallback();
		};

		/**
		 * Show account "page"
		 *
		 * @param item
		 */
		vm.showItem = function (item) {
			vm.itemToShow = item;
			$location.search({}).search("page", item);
		};


		function getAvatarUrl(){
			//var date = "?" + new Date().valueOf();
			var endpoint = vm.username + "/avatar";
			return ClientConfigService
				.apiUrl(ClientConfigService.GET_API, endpoint);
		}

		$scope.$watchGroup(["vm.username", "vm.hasAvatar"], function(){

			if(vm.username && vm.hasAvatar){
				vm.avatarUrl = getAvatarUrl();
			}

		});

		vm.registerUrlCallback = function() {
			var avatar = $element[0].getElementsByClassName("account-avatar-image");
			if (avatar[0]) {
				avatar[0].addEventListener("load", function(){
					vm.imageLoaded = true;
				});
			}	
		};

		vm.upload = function(){

			var file = document.createElement("input");

			file.setAttribute("type", "file");
			file.setAttribute("accept", ".gif,.jpg,.jpeg,.png");
			file.click();

			file.addEventListener("change", function () {

				vm.uploadingAvatar = true;
				var formData = new FormData();
		
				var size = file.files[0].size;
				var maxSize = 1024 * 100;
				if (size < maxSize) {
					formData.append("file", file.files[0]);

					UtilsService.doPost(formData, vm.username + "/avatar", {"Content-Type": undefined}).then(function(res){
						vm.uploadingAvatar = false;
						
						if(res.status === 200){
							vm.avatarUrl = getAvatarUrl();
						} else {
							console.error("Upload avatar error", res.data);
						}

					});

					$scope.$apply();

				} else {
					console.error("Upload avatar error: File is too big!");
				}
				

			});
		};


	}
}());
