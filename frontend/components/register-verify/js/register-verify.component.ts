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

class RegisterVerifyController implements ng.IController {

	public static $inject: string[] = [
		"$window",

		"APIService",
		"StateManager",
	];

	private username;
	private token;
	private verified;
	private showPaymentWait;
	private databaseName;
	private verifyErrorMessage;
	private verifySuccessMessage;

	constructor(
		private $window: ng.IWindowService,

		private APIService,
		private StateManager,
	) {}

	public $onInit() {
		if (
			this.StateManager && this.StateManager.query &&
			this.StateManager.query.username && this.StateManager.query.token
		) {

			this.username = this.StateManager.query.username,
			this.token = this.StateManager.query.token;
			this.verified = false;
			this.showPaymentWait = false;
			this.databaseName = this.username;

			this.verifyErrorMessage = "Verifying. Please wait...";
			this.APIService.post(this.username + "/verify", { token: this.token})
				.then((response) => {
					if (response.status === 200) {
						this.verified = true;
						this.verifySuccessMessage = `Congratulations. You have successfully signed up for 3D Repo.
						You may now login to you account.`;
					} else if (response.data.code === "ALREADY_VERIFIED") {
						this.verified = true;
						this.verifySuccessMessage = `You have already verified your account successfully.
						You may now login to your account.`;
					} else {
						this.verifyErrorMessage = "Error with verification";
					}
				}).catch((error) => {
					if (error.data.code === "ALREADY_VERIFIED") {
						this.verified = true;
						this.verifySuccessMessage = `You have already verified your account successfully.
						You may now login to your account.`;
					} else {
						this.verifyErrorMessage = "Error with verification";
					}
				});

		} else {
			this.verifyErrorMessage = "Can't verify: Token and/or Username not provided";
		}
	}

	public goToLoginPage() {
		this.$window.location.href = "/";
	}

}

export const RegisterVerifyComponent: ng.IComponentOptions = {
	bindings: {},
	controller: RegisterVerifyController,
	controllerAs: "vm",
	templateUrl: "templates/register-verify.html",
};

export const RegisterVerifyComponentModule = angular
	.module("3drepo")
	.component("registerVerify", RegisterVerifyComponent);
