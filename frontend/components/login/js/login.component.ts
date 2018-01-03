import { AuthService } from "../../home/js/auth.service";

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

class LoginController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$location",

		"AuthService",
		"EventService",
		"ClientConfigService",
		"APIService",
	];

	private version: string;
	private userNotice: string;
	private loggingIn: boolean;
	private loginMessage: string;
	private errorMessage: string;
	private user: any;

	constructor(
		private $scope,
		private $location,

		private AuthService,
		private EventService,
		private ClientConfigService,
		private APIService,
	) {}

	public $onInit() {

		this.version = this.ClientConfigService.VERSION;
		this.userNotice = this.ClientConfigService.userNotice;
		this.loggingIn = false;

		// Set a custom login message if there is one
		if (!this.loginMessage) {
			this.loginMessage = "Welcome to 3D Repo";
		}

		this.watchers();

	}

	public watchers() {

		this.$scope.$watch(() => {
			return this.AuthService.state.currentEvent;
		}, () => {
			console.log("changed", this.AuthService.state.currentEvent);
			if (this.AuthService.state.currentEvent === this.AuthService.events.USER_LOGGED_IN) {
				// Show an error message for incorrect login
				if (!this.AuthService.state.currentData.initialiser && this.AuthService.state.currentData.hasOwnProperty("error")) {
					if (this.AuthService.state.currentData.error.status === 500) {
						this.errorMessage = "There is currently a problem with the system. Please try again later.";
					} else {
						this.errorMessage = this.APIService.getErrorMessage(this.AuthService.state.currentData.error);
					}
				}
			}
		});

	}

	public handleLogin() {
		this.errorMessage = "";
		this.loggingIn = true;
		this.AuthService.login(this.user.username, this.user.password)
			.then(() => {
				this.loggingIn = false;
			})
			.catch(() => {
				this.loggingIn = false;
			});
	}

	public login(event: any) {
		const enterKey = 13;

		if (event) {
			if (event.which === enterKey) {
				this.handleLogin();
			}
		} else {
			if (this.user && this.user.username && this.user.password) {
				this.handleLogin();
			} else {

				this.errorMessage = "Username and/or password not provided";
				if (this.user && this.user.password && !this.user.username) {
					this.errorMessage = "Username not provided";
				} else if (this.user && this.user.username && !this.user.password) {
					this.errorMessage = "Password not provided";
				}
			}
		}
	}

}

export const LoginComponent: ng.IComponentOptions = {
	bindings: {
		loginMessage : "<",
	},
	controller: LoginController,
	controllerAs: "vm",
	templateUrl: "templates/login.html",
};

export const LoginComponentModule = angular
	.module("3drepo")
	.component("login", LoginComponent);
