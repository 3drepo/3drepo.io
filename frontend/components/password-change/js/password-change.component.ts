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

import { evaluatePassword } from '../../../services/validation';

class PasswordChangeController implements ng.IController {

	public static $inject: string[] = [
		'$scope',
		'APIService',
		'StateManager',
		'$timeout'
	];

	private pageState;
	private showProgress;
	private enterKey = 13;
	private confirmPassword;
	private message;
	private newPassword;
	private token;
	private username;
	private passwordStrength;
	private passwordConfirmMessage;
	private newPasswordValid: boolean;

	private PAGE_STATE = {
		CHANGING: 0,
		CHANGED: 1,
		INVALID: 2
	};

	constructor(
		private $scope: any,
		private APIService: any,
		private StateManager: any,
		private $timeout: any
	) { }

	public $onInit() {
		this.showProgress = false;
		if (this.token && this.username) {
			this.pageState = this.PAGE_STATE.CHANGING;
		} else {
			this.pageState = this.PAGE_STATE.INVALID;
		}
		this.watchers();
	}

	public watchers() {

		this.$scope.$watch('vm.newPassword', () => {
			this.message = '';
			if (this.newPassword !== undefined) {
				evaluatePassword(this.newPassword).then(({ validPassword, comment }) => {
					this.$timeout(() => {
						this.newPasswordValid = validPassword;
						this.passwordStrength = `(${comment})`;
						this.checkPasswordMatches();
						this.$scope.password.new.$setValidity('invalid', this.newPasswordValid);
					});
				});
			}
		});

		this.$scope.$watch('vm.confirmPassword', () => {
			this.checkPasswordMatches();
		});
	}

	public passwordChange(event) {
		if (event !== undefined && event !== null) {
			if (event.which === this.enterKey) {
				this.doPasswordChange();
			}
		} else {
			// The user called this function via clicking the UI button
			this.doPasswordChange();
		}

	}

	public goToLoginPage() {
		this.StateManager.goHome();
	}

	private checkPasswordMatches() {
		const matched = this.confirmPassword === this.newPassword;
		const showMessage = this.confirmPassword !== undefined &&
									this.confirmPassword !== '' &&
									!matched;
		this.passwordConfirmMessage = showMessage ? '(Password Mismatched)' : '';
		this.$scope.password.confirm.$setValidity('invalid', matched);
	}

	private doPasswordChange() {
		const allowSubmission = this.newPasswordValid && this.newPassword === this.confirmPassword && !this.showProgress;
		if (allowSubmission) {
			this.message = '';
			this.showProgress = true;
			const url = this.username + '/password';

			this.APIService.put(url, {
				newPassword: this.newPassword,
				token: this.token
			}).then((response) => {

				this.showProgress = false;
				this.pageState = this.PAGE_STATE.CHANGED;
			})
			.catch((error) => {
				this.showProgress = false;
				this.message = `Failed: ${error.data.message}`;
			});
		}
	}

}

export const PasswordChangeComponent: ng.IComponentOptions = {
	bindings: {
		token: '=',
		username: '='
	},
	controller: PasswordChangeController,
	controllerAs: 'vm',
	templateUrl: 'templates/password-change.html'
};

export const PasswordChangeComponentModule = angular
	.module('3drepo')
	.component('passwordChange', PasswordChangeComponent);
