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

class PasswordChangeController implements ng.IController {

	public static $inject: string[] = [
		"$scope",

		"APIService",
		"StateManager",
		"PasswordService"
	];

	private promise;
	private passwordChanged;
	private showProgress;
	private enterKey;
	private messageColour;
	private messageErrorColour;
	private buttonDisabled;
	private password;
	private confirmPassword;
	private message;
	private newPassword;
	private token;
	private messageColor;
	private username;
	private passwordStrength;
	private confirmPasswordStrength;
	private duplicateErrMessage;

	constructor(
		private $scope: ng.IScope,

		private APIService: any,
		private StateManager: any,
		private PasswordService: any
	) { }

	public $onInit() {
		this.passwordChanged = false;
		this.showProgress = false;
		this.enterKey = 13;
		this.messageColour = "rgba(0, 0, 0, 0.7)";
		this.messageErrorColour = "#F44336";
		this.buttonDisabled = true;
		this.PasswordService.addPasswordStrengthLib();
		this.watchers();
	}

	public watchers() {

		this.$scope.$watch("vm.newPassword", () => {
			this.message = "";
			if (this.newPassword !== undefined) {
				const result = this.PasswordService.evaluatePassword(this.newPassword);
				this.passwordStrength = this.PasswordService.getPasswordStrength(this.newPassword, result.score);
				this.checkInvalidPassword(result);
			}
		});

		this.$scope.$watch("vm.confirmPassword", () => {
			if (this.confirmPassword !== undefined) {
				const result = this.PasswordService.evaluatePassword(this.confirmPassword);
				this.checkInvalidPassword(result);
			}
		});

		this.$scope.$watch("vm.token", () => {
			if (!this.token) {
				this.messageColor = this.messageErrorColour;
				this.showProgress = false;
				this.message = "Token is missing as URL parameter for password change!";
			}
		});

		this.$scope.$watch("vm.username", () => {
			if (!this.username) {
				this.messageColor = this.messageErrorColour;
				this.showProgress = false;
				this.message = "Username is missing as URL parameter for password change!";
			}
		});

	}

	public checkInvalidPassword(result) {

		const scoreThreshold = 2;

		// check password strength
		if (result.score < scoreThreshold) {
			this.message = "Password is too weak";
			this.messageColor = this.messageErrorColour;
			this.buttonDisabled = true;
		} else {
			this.message = "";
			this.messageColor = this.messageColour;
		}

		// check password duplication
		if (this.confirmPassword !== this.newPassword) {
			this.buttonDisabled = true;
			this.duplicateErrMessage = "(Passwords Mismatched)";
		} else {
			this.duplicateErrMessage = "";
		}

		// check both fields match the needed criteria
		if (result.score > scoreThreshold && this.confirmPassword === this.newPassword) {
			this.buttonDisabled = false;
		}
	}

	public passwordChange(event) {
		if (event !== undefined && event !== null) {
			if (event.which === this.enterKey) {
				this.doPasswordChange();
			}
		} else {
			this.doPasswordChange();
		}
	}

	public goToLoginPage() {
		this.StateManager.goHome();
	}

	public doPasswordChange() {
		if (this.newPassword === this.confirmPassword) {
			if (this.username && this.token) {
				if (this.newPassword && this.newPassword !== "") {
					this.messageColor = this.messageColour;
					this.message = "Please wait...";
					this.showProgress = true;
					this.buttonDisabled = true;
					const url = this.username + "/password";

					this.APIService.put(url, {
						newPassword: this.newPassword,
						token: this.token
					})
						.then((response) => {

							this.showProgress = false;
							if (response.status === 400) {
								this.buttonDisabled = false;
								this.messageColor = this.messageErrorColour;
								this.message = "Error changing password: " + response.data.message;
							} else {
								this.buttonDisabled = true;
								this.passwordChanged = true;
								this.showProgress = false;
								this.messageColor = this.messageColour;
								this.message = "Your password has been reset. Please go to the login page.";
							}
						})
						.catch((error) => {
							this.buttonDisabled = false;
							this.showProgress = false;
							this.messageColor = this.messageErrorColour;
							this.message = "Error changing password";
							if (error.data.message) {
								this.message += ": " + error.data.message;
							}
						});

				} else {
					this.messageColor = this.messageErrorColour;
					this.message = "A new password must be entered";
					this.buttonDisabled = true;
				}
			}
			this.buttonDisabled = true;
			this.message = "Token or username is missing!";
		}
	}
}

export const PasswordChangeComponent: ng.IComponentOptions = {
	bindings: {
		token: "=",
		username: "="
	},
	controller: PasswordChangeController,
	controllerAs: "vm",
	templateUrl: "templates/password-change.html"
};

export const PasswordChangeComponentModule = angular
	.module("3drepo")
	.component("passwordChange", PasswordChangeComponent);
