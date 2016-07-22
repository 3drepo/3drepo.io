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
		.directive("accountDir", accountDir);

	function accountDir() {
		return {
			restrict: "EA",
			templateUrl: "account.html",
			scope: {
				state: "=",
				query: "=",
				account: "="
			},
			controller: AccountCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	AccountCtrl.$inject = ["$scope", "$injector", "$location", "$timeout", "AccountService", "Auth", "UtilsService"];

	function AccountCtrl($scope, $injector, $location, $timeout, AccountService, Auth, UtilsService) {
		var vm = this;

		/*
		 * Get the account data
		 */
		$scope.$watchGroup(["vm.account", "vm.query.page"], function()
		{
			var promise;

			if (vm.account || vm.query.page) {
				// Handle return back from PayPal
				if ($location.search().hasOwnProperty("cancel")) {
					// Cancelled
					init();
				}
				else if ($location.search().hasOwnProperty("token")) {
					// Made a payment
					vm.payPalInfo = "PayPal payment processing. Please do not refresh the page or close the tab.";
					vm.closeDialogEnabled = false;
					UtilsService.showDialog("paypalDialog.html", $scope);
					promise = UtilsService.doPost({token: ($location.search()).token}, "payment/paypal/execute");
					promise.then(function (response) {
						console.log("payment/paypal/execute ", response);
						if (response.status === 200) {
						}
						vm.payPalInfo = "PayPal has finished processing. Thank you.";
						$timeout(function () {
							UtilsService.closeDialog();
							init();
						}, 2000);
					});
				}
				else {
					init();
				}
			} else {
				vm.username        = null;
				vm.firstName       = null;
				vm.lastName        = null;
				vm.email           = null;
				vm.projectsGrouped = null;
			}
		});

		vm.showItem = function (item) {
			vm.itemToShow = item;
		};

		/**
		 * For pages to show other pages
		 *
		 * @param page
		 * @param callingPage
		 */
		vm.showPage = function (page, callingPage) {
			vm.itemToShow = page;
			$location.search("page", page);
			vm.callingPage = callingPage;
		};

		/**
		 * Event listener for change in local storage login status
		 *
		 * @param event
		 */
		function loginStatusListener (event) {
			if ((event.key === "tdrLoggedIn") && (event.newValue === "false")) {
				Auth.logout();
			}
		}
		window.addEventListener("storage", loginStatusListener, false);
		// Set the logged in status to the account name just once
		if ((localStorage.getItem("tdrLoggedIn") === "false") && (vm.account !== null)) {
			localStorage.setItem("tdrLoggedIn", vm.account);
		}

		function init () {
			var userInfoPromise,
				billingsPromise,
				subscriptionsPromise,
				plansPromise;

			userInfoPromise = AccountService.getUserInfo(vm.account);
			userInfoPromise.then(function (response) {
				var i, length;
				console.log("**userInfo** ", response);
				vm.accounts = response.data.accounts;
				vm.username = vm.account;
				vm.firstName = response.data.firstName;
				vm.lastName = response.data.lastName;
				vm.email = response.data.email;

				vm.billingAddress = response.data.billingInfo;
				// Pre-populate billing name if it doesn't exist with profile name
				if (!vm.billingAddress.hasOwnProperty("firstName")) {
					vm.billingAddress.firstName = vm.firstName;
					vm.billingAddress.lastName = vm.lastName;
				}

				for (i = 0, length = vm.accounts.length; i < length; i += 1) {
					if (vm.accounts[i].account === vm.account) {
						vm.quota = vm.accounts[i].quota;
						break;
					}
				}
				console.log(8888, vm.quota);
			});

			billingsPromise = UtilsService.doGet(vm.account + "/billings");
			billingsPromise.then(function (response) {
				console.log("**billings** ", response);
				vm.billings = response.data;
			});

			subscriptionsPromise = UtilsService.doGet(vm.account + "/subscriptions");
			subscriptionsPromise.then(function (response) {
				console.log("**subscriptions** ", response);
				vm.subscriptions = response.data;
			});

			plansPromise = UtilsService.doGet("plans");
			plansPromise.then(function (response) {
				console.log("**plans** ", response);
				if (response.status === 200) {
					vm.plans = response.data;
				}
			});

			// Go to the correct "page"
			if (vm.query.hasOwnProperty("page")) {
				// Check that there is a directive for that "page"
				if ($injector.has("account" + UtilsService.capitalizeFirstLetter(vm.query.page) + "Directive")) {
					vm.itemToShow = vm.query.page;
				}
				else {
					vm.itemToShow = "repos";
				}
			}
			else {
				vm.itemToShow = "repos";
			}
		}
	}
}());
