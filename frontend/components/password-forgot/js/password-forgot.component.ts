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

class PasswordForgotController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"APIService",
	];

	private showProgress;
	private messageColour;
	private messageErrorColour;
	private buttonDisabled;
	private message;
	private username;
	private messageColor;
	private verified;
	private email;

	constructor(
		private $scope: ng.IScope,
		private APIService: any,
	) {}

	public $onInit() {
		this.showProgress = false;
		this.messageColour = "rgba(0, 0, 0, 0.7)";
		this.messageErrorColour = "#F44336";
		this.buttonDisabled = true;
		this.watchers();
	}

	public watchers() {
		this.$scope.$watchGroup(["vm.username", "vm.email"], () => {
			this.message = "";
			if (this.username && this.email) {
				this.buttonDisabled = false;
			}
		});
	}

	public requestPasswordChange(event) {
		const enterKey = 13;
		let requestChange = false;

		if (event !== undefined && event !== null) {
			requestChange = (event.which === enterKey);
		} else {
			requestChange = true;
		}

		if (requestChange) {
			if (this.username && this.email) {

				this.messageColor = this.messageColour;
				this.message = "Please wait...";
				this.showProgress = true;
				this.buttonDisabled = true;
				this.APIService.post(this.username + "/forgot-password", {email: this.email})
					.then((response) => {
						this.showProgress = false;
						if (response.status === 200) {
							this.verified = true;
							this.messageColor = this.messageColour;
							this.message = "Thank you. You will receive an email shortly with a link to change your password";
						} else {
							this.buttonDisabled = false;
							this.messageColor = this.messageErrorColour;
							this.message = response.data.message;
						}
					})
					.catch((error) => {
						this.showProgress = false;
						this.messageColor = this.messageErrorColour;
						this.message = error.data.message;
						this.buttonDisabled = false;
					});

			} else {
				this.messageColor = this.messageErrorColour;
				this.message = "Missing username or email";
			}
		}
	}

}

export const PasswordForgotComponent: ng.IComponentOptions = {
	bindings: {},
	controller: PasswordForgotController,
	controllerAs: "vm",
	templateUrl: "templates/password-forgot.html",
};

export const PasswordForgotComponentModule = angular
	.module("3drepo")
	.component("passwordForgot", PasswordForgotComponent);
