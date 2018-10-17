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

import { debounce, mapValues } from 'lodash';
import { subscribe } from '../../../helpers/migration';
import {
	selectCurrentUser,
	selectIsPending,
	selectTeamspaces
} from '../../../modules/teamspace';

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
	private pageVisibility = {
		teamspaces: true,
		userManagement: false,
		profile: false,
		billing: false,
		modelsetting: false
	} as any;

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
			const teamspaces = selectTeamspaces(state);

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
				accounts: teamspaces,
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

	public capitalizeFirstLetter(str: string) {
		return (str.toString()).charAt(0).toUpperCase() + str.slice(1);
	}

	public setActivePage(page) {
		const visiblePage = this.pageVisibility.hasOwnProperty(page) ? page : 'teamspaces';
		const pageVisibility = mapValues({ ...this.pageVisibility }, (value, key) => key === visiblePage);
		return pageVisibility;
	}

	public handleStateChange = (type, oldValue, newValue) => {
		if (this.account || this.query.page) {
			// Go to the correct "page"
			if (this.query.hasOwnProperty("page")) {
				this.pageVisibility = this.setActivePage(this.query.page);

				// Handle Billing Page
				if (this.pageVisibility.billing) {
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
		this.pageVisibility = this.setActivePage(item);
	}

	/**
	 * For pages to show other pages
	 *
	 * @param page
	 * @param callingPage
	 */
	public showPage(page, callingPage, data) {
		this.pageVisibility = this.setActivePage(page);
		this.callingPage = callingPage;
		this.data = data;
	}

	public getUserInfo = () => {
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
