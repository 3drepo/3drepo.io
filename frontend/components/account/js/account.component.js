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
			templateUrl: "templates/account.html",
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
			vm.accountInitialised = false;
			vm.userInfoPromise = null;
			vm.loadingAccount = true;

			vm.initUserData();

			window.addEventListener("storage", loginStatusListener, false);
			// Set the logged in status to the account name just once
			if ((localStorage.getItem("tdrLoggedIn") === "false") && (vm.account !== null)) {
				localStorage.setItem("tdrLoggedIn", vm.account);
			}

		};


		vm.initUserData = function() {
			return vm.getUserInfo();
		};

		/*
		 * Init
		 */
		vm.initDirectiveData = function(directive) {

			if (!vm.accountInitialised) {
				// TODO: This is also a mess
				vm.getUserInfo().then(function(){
					AuthService.authPromise.then(function(){
						AccountService.accountPromise.then(function(){
							vm.handleDirectiveInit(directive);
						});
					});
				});
			} else {
				vm.handleDirectiveInit(directive);
			}
			
		};

		vm.handleDirectiveInit = function(directive) {
			// If you go to a different URL teamspace you need to check 
			// that you are actually the user in question!

			// TODO: This shouldn't be necessary

			if (vm.username === AuthService.getUsername()) {

				if (directive === "billing") {
					vm.initSubscriptions();
					vm.initBillings();
					vm.initPlans();
				}
				
				if (directive === "licenses") {
					vm.initSubscriptions();
				}

			} 
		};

		vm.initBillings = function() {
			return UtilsService.doGet(vm.account + "/invoices")
				.then(function (response) {
					vm.billings = response.data;
				});
		};

		vm.initPlans = function() {
			return UtilsService.doGet("plans")
				.then(function (response) {
					if (response.status === 200) {
						vm.plans = response.data;
					}
				});
		};

		vm.initSubscriptions = function() {
			return UtilsService.doGet(vm.account + "/subscriptions")
				.then(function (response) {
					vm.subscriptions = response.data;
				});
		};

		vm.handleStateChange = function(type, oldValue, newValue) {

			// TODO: This is total mess... needs refactor!
			// semes like page and vm.itemToShow do similar things?

			if (vm.account || vm.query.page) {
				// Go to the correct "page"
				if (vm.query.hasOwnProperty("page")) {
					// Check that there is a directive for that "page"
					var page = UtilsService.capitalizeFirstLetter(vm.query.page);
					var directiveExists = "account" + page + "Directive";
					if ($injector.has(directiveExists)) {
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

					
						} else if ($location.search().hasOwnProperty("token")) {
							// Get initial user info, which may change if returning from PayPal

							// Made a payment
							
							vm.payPalInfo = "PayPal payment processing. Please do not refresh the page or close the tab.";
							vm.closeDialogEnabled = false;
							UtilsService.showDialog("paypal-dialog.html", $scope);
							UtilsService.doPost({token: ($location.search()).token}, "payment/paypal/execute")
								.then(function (response) {
									if (response.status !== 200) {
										console.error("PayPal error", response);
									}
									vm.payPalInfo = "PayPal has finished processing. Thank you.";

									// Clear token URL parameter
									$location.search("token", null);

									$timeout(function () {
										UtilsService.closeDialog();
										//initDirectiveData();
									}, 2000);

								}).catch(function(error){
									console.error("PayPal error", error);
								});

						} 

					}
					
					// Initialise the account data if its
					// an account change, and directive data for 
					// correct page

					if (type === "page" && vm.itemToShow) {
						vm.initDirectiveData(vm.itemToShow);
					} else if (type === "account" && newValue) {
						vm.initUserData();
					}
					
				} else {
					vm.itemToShow = "teamspaces";
				}

			} else {
				vm.username        = null;
				vm.firstName       = null;
				vm.lastName        = null;
				vm.email           = null;
				vm.modelsGrouped = null;
				vm.avatarUrl = null;
			}
			
		};

		/*
		 * Get the account data
		 */
		$scope.$watch("vm.account", function(oldValue, newValue) {
			vm.handleStateChange("account", oldValue, newValue);
		}, true);

		$scope.$watch("vm.query.page", function(oldValue, newValue) {
			vm.handleStateChange("page", oldValue, newValue);
		}, true);

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

		vm.getUserInfo = function() {

			if (vm.userInfoPromise) {
				return vm.userInfoPromise;
			} else {

				vm.userInfoPromise = AccountService.getUserInfo(vm.account)
					.then(function(response) {

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
								for (var i = 0; i < vm.accounts.length; i++) {
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
						

					})
					.catch(function(error){
						//TODO ADD POPUP ERROR!
						console.error("Error", error);
					});
				
				return vm.userInfoPromise;
			}

		};
	}
}());
