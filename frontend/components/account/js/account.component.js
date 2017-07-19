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
		.component("accountDir", {
			restrict: "EA",
			templateUrl: "account.html",
			bindings: {
				state: "=",
				query: "=",
				account: "=",
				keysDown: "="
			},
			controller: AccountCtrl,
			controllerAs: "vm"
		});

	AccountCtrl.$inject = ["$scope", "$injector", "$location", "$timeout", "AccountService", "AuthService", "UtilsService"];

	function AccountCtrl($scope, $injector, $location, $timeout, AccountService, AuthService, UtilsService) {
		var vm = this;

		vm.$onInit = function() {
			
			vm.loadingAccount = true;
			window.addEventListener("storage", loginStatusListener, false);
			// Set the logged in status to the account name just once
			if ((localStorage.getItem("tdrLoggedIn") === "false") && (vm.account !== null)) {
				localStorage.setItem("tdrLoggedIn", vm.account);
			}

		};


		/*
		 * Init
		 */
		function initAccount () {
			var billingsPromise,
				subscriptionsPromise,
				plansPromise;
			

			// TODO: This is also a mess
			getUserInfo();

			if (vm.username === AuthService.username) {
		
				billingsPromise = UtilsService.doGet(vm.account + "/invoices");
				billingsPromise.then(function (response) {
					vm.billings = response.data;
				});

				subscriptionsPromise = UtilsService.doGet(vm.account + "/subscriptions");
				subscriptionsPromise.then(function (response) {
					vm.subscriptions = response.data;
				});

				plansPromise = UtilsService.doGet("plans");
				plansPromise.then(function (response) {
					if (response.status === 200) {
						vm.plans = response.data;
					}
				});
			} 
			
		}

		/*
		 * Get the account data
		 */
		$scope.$watchGroup(["vm.account", "vm.query.page"], function() {
			var promise;

			// TODO: This is total mess... needs refactor!

			if (vm.account || vm.query.page) {
				// Go to the correct "page"
				if (vm.query.hasOwnProperty("page")) {
					// Check that there is a directive for that "page"
					if ($injector.has("account" + UtilsService.capitalizeFirstLetter(vm.query.page) + "Directive")) {
						vm.itemToShow = vm.query.page;
					} else {
						vm.itemToShow = "teamspaces";
					}

					// Handle Billing Page
					if (vm.itemToShow === "billing") {
						// Handle return back from PayPal
						if ($location.search().hasOwnProperty("cancel")) {
							// Cancelled

							// Clear token URL parameters
							$location.search("token", null);
							$location.search("cancel", null);

							initAccount();
						} else if ($location.search().hasOwnProperty("token")) {
							// Get initial user info, which may change if returning from PayPal
							getUserInfo();

							// Made a payment
							
							vm.payPalInfo = "PayPal payment processing. Please do not refresh the page or close the tab.";
							vm.closeDialogEnabled = false;
							UtilsService.showDialog("paypal-dialog.html", $scope);
							promise = UtilsService.doPost({token: ($location.search()).token}, "payment/paypal/execute");
							promise.then(function (response) {
								if (response.status !== 200) {
									console.error("PayPal error", response);
								}
								vm.payPalInfo = "PayPal has finished processing. Thank you.";

								// Clear token URL parameter
								$location.search("token", null);

								$timeout(function () {
									UtilsService.closeDialog();
									initAccount();
								}, 2000);
							}).catch(function(error){
								console.error("PayPal error", error);
							});

						} else {
							initAccount();
						}
					} else {
						initAccount();
					}
				} else {
					vm.itemToShow = "teamspaces";
					initAccount();
				}

			} else {
				vm.username        = null;
				vm.firstName       = null;
				vm.lastName        = null;
				vm.email           = null;
				vm.modelsGrouped = null;
				vm.avatarUrl = null;
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
		vm.showPage = function (page, callingPage, data) {
			UnityUtil.reset();
			vm.itemToShow = page;
			vm.callingPage = callingPage;
			vm.data = data;
		};

		/**
		 * Event listener for change in local storage login status
		 *
		 * @param event
		 */
		function loginStatusListener (event) {
			if ((event.key === "tdrLoggedIn") && (event.newValue === "false")) {
				AuthService.logout();
			}
		}

		function getUserInfo () {
			var userInfoPromise;

			userInfoPromise = AccountService.getUserInfo(vm.account);
			userInfoPromise.then(function(response) {

				var i, length;

				if (response.data) {
					vm.accounts = response.data.accounts;
					vm.username = vm.account;
					vm.firstName = response.data.firstName;
					vm.lastName = response.data.lastName;
					vm.email = response.data.email;
					vm.hasAvatar = response.data.hasAvatar;

					// Pre-populate billing name if it doesn't exist with profile name
					vm.billingAddress = {};
					if (response.data.hasOwnProperty("billingInfo")) {
						vm.billingAddress = response.data.billingInfo;
						if (!vm.billingAddress.hasOwnProperty("firstName")) {
							vm.billingAddress.firstName = vm.firstName;
							vm.billingAddress.lastName = vm.lastName;
						}
					}

					// Get quota
					if (angular.isDefined(vm.accounts)) {
						for (i = 0, length = vm.accounts.length; i < length; i += 1) {
							if (vm.accounts[i].account === vm.account) {
								vm.quota = vm.accounts[i].quota;
								break;
							}
						}
					}

					vm.loadingAccount = false;
				} else {
					console.debug("Reponse doesn't have data", response);
				}
				

			});

		}
	}
}());
