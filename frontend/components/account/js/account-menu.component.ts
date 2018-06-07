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

class AccountMenuController implements ng.IController {

	public static $inject: string[] = [
		"$scope",

		"AuthService",
		"StateManager"
	];

	private $mdOpenMenu;
	private userAccount;
	private showLiteModeButton;
	private isLiteMode;

	constructor(
		private $scope: ng.IScope,

		private AuthService: any,
		private StateManager: any
	) {}

	public $onInit() {
		this.userAccount = this.AuthService.getUsername();
	}

	public handleLiteModeChange() {
		if (this.isLiteMode !== undefined && this.isLiteMode !== null) {
			localStorage.setItem("liteMode", this.isLiteMode);
			location.reload();
		}
	}

	/**
	 * Open menu
	 * @param $mdOpenMenu
	 * @param ev
	 */
	public openMenu($mdOpenMenu: any, ev: any) {
		$mdOpenMenu(ev);
	}

	/**
	 * Show user models
	 */
	public showTeamspaces() {
		this.StateManager.resetServiceStates();
		this.StateManager.goHome();
	}

	/**
	 * Logout
	 */
	public logout() {
		this.StateManager.resetServiceStates();
		this.AuthService.logout();
	}

	public openUserManual() {
		window.open("http://3drepo.org/models/3drepo-io-user-manual/", "_blank");
	}

	public hasMemorySettings() {
		const mem = localStorage.getItem("deviceMemory");
		return !!mem;
	}

	public resetMemorySettings() {
		localStorage.removeItem("deviceMemory");
	}

}

export const AccountMenuComponent: ng.IComponentOptions = {
	bindings: {
		showLiteModeButton: "=",
		isLiteMode: "="
	},
	controller: AccountMenuController,
	controllerAs: "vm",
	templateUrl: "templates/account-menu.html"
};

export const AccountMenuComponentModule = angular
	.module("3drepo")
	.component("accountMenu", AccountMenuComponent);
