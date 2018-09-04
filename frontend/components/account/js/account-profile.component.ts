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
class AccountProfileController implements ng.IController {

	public static $inject: string[] = [
		"AccountService",
		"PasswordService",

		"$scope"
	];

	private emailNew;
	private username;
	private firstNameNew;
	private lastNameNew;
	private infoSaveInfo;
	private updateError;
	private firstName;
	private lastName;
	private email;
	private oldPassword;
	private newPassword;
	private passwordSaveInfo;
	private passwordSaveError;
	private showInfo;
	private showChangePassword;
	private passwordValid;
	private passwordStrength;

	constructor(
		private AccountService: any,
		private PasswordService: any,

		private $scope: any
	) {}

	/*
		* Init
		*/
	public $onInit() {
		this.showInfo = true;
		this.showChangePassword = false;
		this.firstNameNew = this.firstName;
		this.lastNameNew = this.lastName;
		this.emailNew = this.email;
		this.passwordStrength = "";
		this.watchers();
	}

	public watchers() {
		this.$scope.$watch("vm.newPassword", (newPassword) => {

			if (newPassword === undefined) {
				newPassword = "";
			}

			const result = this.PasswordService.evaluatePassword(newPassword);
			this.passwordStrength = `(${result.comment})`;
			this.passwordValid = result.validPassword;
			this.$scope.password.new.$setValidity("required", this.passwordValid);

		});
	}

	/**
	 * Update the user info
	 */
	public updateInfo() {
		this.AccountService.updateInfo(this.username, {
			email: this.emailNew,
			firstName: this.firstNameNew,
			lastName: this.lastNameNew
		})
			.then((response) => {
				this.infoSaveInfo = "Saved";
				this.updateError = "";
				this.firstName = this.firstNameNew;
				this.lastName = this.lastNameNew;
				this.email = this.emailNew;
			})
			.catch((error) => {
				if (error && error.data && error.data.message) {
					this.updateError = error.data.message;
				} else {
					this.updateError = "Unknown error updating profile";
				}
			});
	}

	/**
	 * Update the user password
	 */
	public updatePassword() {
		this.AccountService.updatePassword(this.username, {
			oldPassword: this.oldPassword,
			newPassword: this.newPassword
		})
			.then((response) => {
				if (response.status === 200) {
					this.passwordSaveInfo = "Saved";
					this.passwordSaveError = "";
				} else {
					this.passwordSaveError = response.data.message;
				}
			})
			.catch((error) =>  {
				if (error && error.data && error.data.message) {
					if (error.data.code === "INCORRECT_USERNAME_OR_PASSWORD") {
						this.passwordSaveError = "Your old password was incorrect";
					} else {
						this.passwordSaveError = error.data.message;
					}
				} else {
					this.passwordSaveError = "Unknown error updating password";
				}
			});
	}

	public passwordUpdateDisabled() {
		const inputValid = this.oldPassword && this.newPassword
							&& this.oldPassword === this.newPassword
							&& passwordValid;
		return !inputValid;
	}

	public canUpdate() {

		const valid = this.firstNameNew &&
				this.lastNameNew &&
				this.emailNew;

		const notSame = this.firstName !== this.firstNameNew ||
					this.lastName !== this.lastNameNew ||
					this.email !== this.emailNew;

		return valid && notSame;

	}

	/**
	 * Toggle showing of user info
	 */
	public toggleInfo() {
		this.showInfo = !this.showInfo;
	}

	/**
	 * Toggle showing of password change
	 */
	public toggleChangePassword() {
		this.showChangePassword = !this.showChangePassword;
	}

}

export const AccountProfileComponent: ng.IComponentOptions = {
	bindings: {
		username: "=",
		firstName: "=",
		lastName: "=",
		email: "="
	},
	controller: AccountProfileController,
	controllerAs: "vm",
	templateUrl: "templates/account-profile.html"
};

export const AccountProfileComponentModule = angular
	.module("3drepo")
	.component("accountProfile", AccountProfileComponent);
