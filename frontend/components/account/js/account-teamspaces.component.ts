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

class AccountTeamspacesController implements ng.IController {

	public static $inject: string[] = [
	];

	private loading;
	private isMobileDevice;
	private account;
	private accounts;
	private onShowPage;
	private quota;
	private subscriptions;

	constructor(
	) {}

	public $onInit() {}

	public showPage(page, callingPage, data) {
		this.onShowPage({page, callingPage, data});
	}

}

export const AccountTeamspacesComponent: ng.IComponentOptions = {
	bindings: {
		account: "=",
		accounts: "=",
		onShowPage: "&",
		quota: "=",
		subscriptions: "=",
		loading: "=",
		selectedIndex: "=",
		itemToShow: "=",
		isMobileDevice: "<",
	},
	controller: AccountTeamspacesController,
	controllerAs: "vm",
	templateUrl: "templates/account-teamspaces.html",
};

export const AccountTeamspacesComponentModule = angular
	.module("3drepo")
	.component("accountTeamspaces", AccountTeamspacesComponent);
