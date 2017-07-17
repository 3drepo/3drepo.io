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
		.component("contact", {
			restrict: "E",
			bindings: {},
			templateUrl: "contact.html",
			controller: ContactCtrl,
			controllerAs: "vm"
		});

	ContactCtrl.$inject = ["$scope", "UtilsService"];

	function ContactCtrl ($scope, UtilsService) {
		var vm = this,
			promise;

		/*
		 * Init
		 */
		vm.$onInit = function() {
			vm.contact = {information: "", name: "", email: ""};
			vm.sent = false;
			vm.sending = false;
			vm.emailRegex = /^[_a-z0-9-]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
		};

		/*
		 * Watch to enable send button
		 */
		$scope.$watch("vm.contact", function () {
			vm.sendButtonDisabled = (
				(vm.contact.information === "") ||
				(vm.contact.name === "") ||
				(vm.contact.email === "") ||
				(angular.isUndefined(vm.contact.email))
			);
		}, true);

		vm.send = function () {
			vm.sending = true;
			promise = UtilsService.doPost(vm.contact, "contact");
			promise.then(function (response) {
				vm.sending = false;
				if (response.status === 200) {
					vm.sent = true;
				}
			});
		};
	}
}());
