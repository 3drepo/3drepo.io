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

class RegisterRequestController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$window",

		"AuthService",
		"$location",
	];

	constructor(
		private $scope: ng.IScope,
		private $window: ng.IWindowService,

		private AuthService,
		private $location,
	) {}

	public $onInit() {

		// TODO: this is a hack
		this.AuthService.sendLoginRequest().then((response) => {
			if (response.data.username) {
				this.goToLoginPage();
			}
		}).catch(() => {
			console.debug("User is not logged in");
		});

		this.watchers();

	}

	public watchers() {
		this.$scope.$watch("AuthService.isLoggedIn()", (newValue) => {
			// TODO: this is a hack
			if (newValue === true) {
				this.goToLoginPage();
			}
		});
	}

	public goToLoginPage() {
		this.$location.path("/");
	}

}

export const RegisterRequestComponent: ng.IComponentOptions = {
	bindings: {
		state: "=",
	},
	controller: RegisterRequestController,
	controllerAs: "vm",
	templateUrl: "templates/register-request.html",
};

export const RegisterRequestComponentModule = angular
	.module("3drepo")
	.component("registerRequest", RegisterRequestComponent);
