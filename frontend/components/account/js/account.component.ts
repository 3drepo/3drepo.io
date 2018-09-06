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

import debounce from "lodash/debounce";
import { subscribe } from "../../../helpers/migration";
import {
	selectCurrentUser,
	selectIsPending
} from "../../../modules/teamspace";

class AccountController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$injector",
		"$location",
		"$timeout",
		"AccountService",
		"AuthService",
		"APIService",
		"DialogService"
	];

	private accountInitialised;
	private userInfoPromise;
	private loadingAccount;
	private username;
	private account;
	private query;
	private itemToShow;
	private firstName;
	private lastName;
	private email;
	private modelsGrouped;
	private avatarUrl;
	private payPalInfo;
	private closeDialogEnabled;
	private callingPage;
	private data;
	private accounts;
	private billingAddress;
	private hasAvatar;
	private showLiteModeButton;

	constructor(
		private $scope,
		private $injector,
		private $location,
		private $timeout,
		private AccountService,
		private AuthService,
		private APIService,
		private DialogService
	) {
		this.getUserInfo = debounce(this.getUserInfo, 150);

		subscribe(this, (state) => {
			const currentUser = selectCurrentUser(state);
			const isPending = selectIsPending(state);

			// Pre-populate billing name if it doesn't exist with profile name
			let billingAddress: any = {};
			if (currentUser.hasOwnProperty("billingInfo") && currentUser.firstName !== this.firstName) {
				billingAddress = currentUser.billingInfo;
				if (!billingAddress.hasOwnProperty("firstName")) {
					billingAddress.firstName = currentUser.firstName;
					billingAddress.lastName = currentUser.lastName;
				}
			}

			return {
				...currentUser,
				billingAddress,
				loadingAccount: isPending
			};
		});
	}

	public $onInit() {

		this.accountInitialised = false;
		this.userInfoPromise = null;
		this.loadingAccount = true;

		this.initUserData();
		this.watchers();
	}

	public watchers() {

		/*
		* Get the account data
		*/
		this.$scope.$watch("vm.account", (oldValue, newValue) => {
			this.handleStateChange("account", oldValue, newValue);
		}, true);

		this.$scope.$watch("vm.query.page", (oldValue, newValue) => {
			this.handleStateChange("page", oldValue, newValue);
		}, true);

	}

	public initUserData() {
		return this.getUserInfo();
	}

	/*
	 * Init
	 */
	public initDirectiveData(directive) {

		if (!this.accountInitialised) {
			// TODO: This is also a mess
			this.getUserInfo();

		}
	}

	public capitalizeFirstLetter(str: string) {
		return (str.toString()).charAt(0).toUpperCase() + str.slice(1);
	}

	public handleStateChange(type, oldValue, newValue) {

		// TODO: This is total mess... needs refactor!
		// semes like page and this.itemToShow do similar things?

		if (this.account || this.query.page) {
			// Go to the correct "page"
			if (this.query.hasOwnProperty("page")) {
				// Check that there is a directive for that "page"
				const page = this.capitalizeFirstLetter(this.query.page);
				const directiveExists = "account" + page + "Directive";

				if (this.$injector.has(directiveExists)) {
					this.itemToShow = this.query.page;
				} else {
					this.itemToShow = "teamspaces";
				}

				// Handle Billing Page
				if (this.itemToShow === "billing") {
					// Handle return back from PayPal
					if (this.$location.search().hasOwnProperty("cancel")) {
						// Cancelled

						// Clear token URL parameters
						this.$location.search("token", null);
						this.$location.search("cancel", null);

					} else if (this.$location.search().hasOwnProperty("token")) {
						// Get initial user info, which may change if returning from PayPal
						this.handlePayment();
					}

				}

				// Initialise the account data if its
				// an account change, and directive data for
				// correct page

				if (type === "page" && this.itemToShow) {
					this.initDirectiveData(this.itemToShow);
				} else if (type === "account" && newValue) {
					this.initUserData();
				}

			} else {
				this.itemToShow = "teamspaces";
			}

		} else {
			this.username        = null;
			this.firstName       = null;
			this.lastName        = null;
			this.email           = null;
			this.modelsGrouped = null;
			this.avatarUrl = null;
		}

	}

	public handlePayment() {

		const token = (this.$location.search()).token;
		this.payPalInfo = "PayPal payment processing. Please do not refresh the page or close the tab.";
		this.closeDialogEnabled = false;
		this.DialogService.showDialog("paypal-dialog.html", this.$scope);
		this.APIService.post("payment/paypal/execute", {token})
			.then((response) => {
				if (response.status !== 200) {
					console.error("PayPal error", response);
				}
				this.payPalInfo = "PayPal has finished processing. Thank you.";

				// Clear token URL parameter
				this.$location.search("token", null);

				this.$timeout(() => {
					this.DialogService.closeDialog();
				}, 2000);

			}).catch((error) => {
				console.error("PayPal error", error);
			});

	}

	public showItem(item) {
		this.itemToShow = item;
	}

	/**
	 * For pages to show other pages
	 *
	 * @param page
	 * @param callingPage
	 */
	public showPage(page, callingPage, data) {
		this.itemToShow = page;
		this.callingPage = callingPage;
		this.data = data;
	}

	public getUserInfo = () => {
		debugger
		this.userInfoPromise = this.AccountService.getUserInfo(this.account);
	}
}

export const AccountComponent: ng.IComponentOptions = {
	bindings: {
		state: "=",
		query: "=",
		account: "=",
		isLiteMode: "=",
		showLiteModeButton: "<"

	},
	controller: AccountController,
	controllerAs: "vm",
	templateUrl: "templates/account.html"
};

export const AccountComponentModule = angular
	.module("3drepo")
	.component("accountDir", AccountComponent);
