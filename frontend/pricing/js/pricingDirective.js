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
		.directive("pricing", pricing);

	function pricing() {
		return {
			restrict: "E",
			scope: {},
			templateUrl: "pricing.html",
			controller: PricingCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	PricingCtrl.$inject = ["$location"];

	function PricingCtrl ($location) {
		var vm = this;

		/**
		 * Go to a sub page
		 *
		 * @param page
		 */
		vm.showPage = function (page) {
			$location.path("/" + page, "_self");
		};
	}
}());
