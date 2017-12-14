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
class AccountBillingController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$window",
		"$timeout",

		"ClientConfigService",
		"DialogService",
		"APIService",
	];

	private showInfo;
	private saveDisabled;
	private countries;
	private usStates;
	private showStates;
	private newBillingAddress;
	private numLicenses;
	private account;
	private billings;
	private countrySelectDisabled;
	private companyNameRequired;
	private billingAddress;
	private subscriptions;
	private plans;
	private numNewLicenses;
	private payPalInfo;
	private closeDialogEnabled;
	private changeHelpToShow;
	private payPalError;
	private pricePerLicense;
	private priceLicenses;

	constructor(
		private $scope,
		private $window,
		private $timeout,

		private ClientConfigService,
		private DialogService,
		private APIService,
	) {}

	public $onInit() {
		this.showInfo = true;
		this.saveDisabled = true;
		this.countries = this.ClientConfigService.countries;
		this.usStates = this.ClientConfigService.usStates;
		this.showStates = false;
		this.newBillingAddress = {};
		this.watchers();
	}

	public watchers() {

		/*
		* Watch for change in licenses
		*/
		this.$scope.$watch("vm.numNewLicenses", () => {

			if (this.isDefined(this.numNewLicenses)) {
				if ((this.numLicenses === 0) && (this.numNewLicenses === 0)) {
					this.saveDisabled = true;
				} else if (this.numLicenses === this.numNewLicenses) {
					this.saveDisabled = angular.equals(this.newBillingAddress, this.billingAddress) ||
										this.aRequiredAddressFieldIsEmpty();
				} else {
					this.saveDisabled = this.aRequiredAddressFieldIsEmpty();
				}
				this.priceLicenses = this.numNewLicenses * this.pricePerLicense;
			} else {
				this.saveDisabled = true;
			}
		});

		/*
			* Watch passed billing address
			*/
		this.$scope.$watch("vm.billingAddress", () => {
			if (this.isDefined(this.billingAddress)) {
				this.newBillingAddress = angular.copy(this.billingAddress);
				// Cannot change country
				this.countrySelectDisabled = this.isDefined(this.billingAddress.countryCode);
			}
		}, true);

		/*
			* Watch for change in billing info
			*/
		this.$scope.$watch("vm.newBillingAddress", () => {
			if (this.isDefined(this.newBillingAddress)) {
				if (this.numNewLicenses !== 0) {
					this.saveDisabled = angular.equals(this.newBillingAddress, this.billingAddress) ||
										this.aRequiredAddressFieldIsEmpty();

					// Company name required if VAT number exists
					this.companyNameRequired = (this.isDefined(this.newBillingAddress.vat) && (this.newBillingAddress.vat !== ""));
				}
				this.showStates = (this.newBillingAddress.countryCode === "US");
			}
		}, true);

		/*
			* Watch for subscriptions
			*/
		this.$scope.$watch("vm.subscriptions", () => {
			if (this.isDefined(this.subscriptions) && this.isDefined(this.plans)) {
				this.setupLicensesInfo();
			}
		}, true);

		/*
			* Watch for plans
			*/
		this.$scope.$watch("vm.plans", () => {
			if (this.isDefined(this.subscriptions) && this.isDefined(this.plans)) {
				this.setupLicensesInfo();
			}
		}, true);

		/*
			* Watch for billings
			*/
		this.$scope.$watch("vm.billings", () => {

			if (this.isDefined(this.billings)) {
				for (let i = 0; i < this.billings.length; i ++) {
					if (this.billings[i].type === "refund") {
						this.billings[i].status = "Completed";
						this.billings[i].description = "Refund";
					} else {
						this.billings[i].status = this.billings[i].pending ? "Pending" : "Paid";
						this.billings[i].description = this.billings[i].items[0].description;
					}
				}
			}

		});

	}

	public isDefined(value) {
		return value !== undefined && value !== null;
	}

	/**
	 * Show the billing page with the item
	 */
	public downloadBilling(index) {
		// $window.open("/billing?user=" + this.account + "&item=" + index);
		const endpoint = this.account + "/invoices/" + this.billings[index].invoiceNo + ".pdf";
		const url = this.ClientConfigService.apiUrl(this.ClientConfigService.GET_API, endpoint);
		this.$window.open(url, "_blank");
	}

	public changeSubscription() {
		const data = {
			plans: [{
				plan: "THE-100-QUID-PLAN",
				quantity: this.numNewLicenses,
			}],
			billingAddress: this.newBillingAddress,
		};

		if (this.numLicenses === this.numNewLicenses) {
			this.payPalInfo = "Updating billing information. Please do not refresh the page or close the tab.";
		} else {
			this.payPalInfo = "Redirecting to PayPal. Please do not refresh the page or close the tab.";
		}

		this.DialogService.showDialog("paypal-dialog.html", this.$scope, null, true);

		const payPalError = `Unfortunately something went wrong contacting PayPal.
				Please contact support@3drepo.org if this continues.`;

		this.APIService.post(this.account + "/subscriptions", data)
			.then((response) => {
				if (response.status === 200) {
					if (this.numLicenses === this.numNewLicenses) {
						this.payPalInfo = "Billing information updated.";
						this.$timeout(() => {
							this.DialogService.closeDialog();
						}, 2000);
					} else {
						location.href = response.data.url;
					}
				} else {
					this.closeDialogEnabled = true;
					this.changeHelpToShow = response.data.value;
					this.payPalError = payPalError;
					this.payPalInfo = "Details: " + response.data.message;
				}
			})
			.catch((error) => {
				this.payPalError = payPalError;
				this.closeDialogEnabled = true;
			});
	}

	public closeDialog() {
		this.DialogService.closeDialog();
	}

	/**
	 * Set up num licenses and price
	 */
	public setupLicensesInfo() {
		this.numLicenses = this.subscriptions.filter((sub) => {
			return sub.inCurrentAgreement;
		}).length;
		this.numNewLicenses = this.numLicenses;
		this.pricePerLicense = this.plans[0].amount;
	}

	/**
	 * Check if any required input fields is empty
	 */
	public aRequiredAddressFieldIsEmpty(): boolean {

		const vat = (this.isDefined(this.newBillingAddress.vat) &&
					(this.newBillingAddress.vat !== "") &&
					!this.isDefined(this.newBillingAddress.company));

		const us = ((this.newBillingAddress.countryCode === "US") &&
					!this.isDefined(this.newBillingAddress.state));

		return (
			!this.isDefined(this.newBillingAddress.firstName) ||
			!this.isDefined(this.newBillingAddress.lastName) ||
			!this.isDefined(this.newBillingAddress.line1) ||
			!this.isDefined(this.newBillingAddress.postalCode) ||
			!this.isDefined(this.newBillingAddress.city) ||
			!this.isDefined(this.newBillingAddress.countryCode) ||
			vat ||
			us
		);
	}

}

export const AccountBillingComponent: ng.IComponentOptions = {
	bindings: {
		account: "=",
		billingAddress: "=",
		quota: "=",
		billings: "=",
		subscriptions: "=",
		plans: "=",
	},
	controller: AccountBillingController,
	controllerAs: "vm",
	templateUrl: "templates/account-billing.html",
};

export const AccountBillingComponentModule = angular
	.module("3drepo")
	.component("accountBilling", AccountBillingComponent);
