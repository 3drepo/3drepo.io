
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

import { subscribe } from '../../../helpers/migration';
import { selectAvatar, selectIsAvatarPending } from "../../../modules/teamspace";

class AccountInfoController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$location",
		"$element",
		"$mdDialog",

		"ClientConfigService",
		"APIService"
	];

	private accountOptions;
	private imageLoaded;
	private itemToShow;
	private uploadingAvatar;
	private username;
	private hasAvatar;
	private avatarUrl;

	constructor(
		private $scope: ng.IScope,
		private $location: ng.ILocationService,
		private $element: ng.IRootElementService,
		private $mdDialog: any,

		private ClientConfigService: any,
		private APIService: any
	) {
		subscribe(this, {
			avatarUrl: selectAvatar,
			isAvatarPending: selectIsAvatarPending
		});
	}

	public $onInit() {
		this.accountOptions = {
			teamspaces: {label: "Teamspaces"},
			userManagement: {label: "User Management"},
			profile: {label: "Profile"},
			billing: {label: "Billing"}
		};
		this.imageLoaded = false;
		this.registerUrlCallback();
	}

	/**
	 * Set the query paramter for the page to the desired page
	 */
	public showItem(item: string) {
		this.itemToShow = item;
		this.$location.search({}).search("page", item);
	}

	/**
	 * Return the URL of the users avatar
	 */
	public registerUrlCallback() {
		const avatar = this.$element[0].getElementsByClassName("account-avatar-image");
		if (avatar[0]) {
			avatar[0].addEventListener("load", () => {
				this.imageLoaded = true;
			});
		}
	}
}

export const AccountInfoComponent: ng.IComponentOptions = {
	bindings:  {
		username: "=",
		firstName: "=",
		lastName: "=",
		email: "=",
		itemToShow: "=",
		hasAvatar: "=",
		loading: "="
	},
	controller: AccountInfoController,
	controllerAs: "vm",
	templateUrl: "templates/account-info.html"
};

export const AccountInfoComponentModule = angular
	.module("3drepo")
	.component("accountInfo", AccountInfoComponent);
