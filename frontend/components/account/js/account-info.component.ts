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

class AccountInfoController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$location",
		"$element",
		"$mdDialog",

		"ClientConfigService",
		"APIService",
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
		private APIService: any,
	) {}

	public $onInit() {
		this.accountOptions = {
			teamspaces: {label: "Teamspaces"},
			profile: {label: "Profile"},
			billing: {label: "Billing"},
			licenses: {label: "Licences & Jobs"},
			assign: {label: "Assign Permissions" },
		};
		this.imageLoaded = false;
		this.registerUrlCallback();
		this.watchers();
	}

	/**
	 * Setup the watchers foraccount information
	 */
	public watchers() {
		this.$scope.$watchGroup(["vm.username", "vm.hasAvatar"], () => {

			if (this.username && this.hasAvatar) {
				this.avatarUrl = this.getAvatarUrl();
			}

		});
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
	public getAvatarUrl() {

		// Date required to trigger change (otherwise URL is the same)
		const date = "?" + new Date().valueOf();
		const endpoint = this.username + "/avatar" + date;
		return this.ClientConfigService
			.apiUrl(this.ClientConfigService.GET_API, endpoint);

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

	/**
	 * Return the URL of the users avatar
	 */
	public uploadAvatar() {

		const file = document.createElement("input");

		file.setAttribute("type", "file");
		file.setAttribute("accept", ".gif,.jpg,.jpeg,.png");
		file.click();

		file.addEventListener("change", () => {

			this.uploadingAvatar = true;
			const formData = new FormData();

			const size = file.files[0].size;
			const maxSizeUser = "1 MB";
			const maxSize = 1024 * 1024; // 1 MB
			if (size < maxSize) {
				formData.append("file", file.files[0]);
				this.postAvatar(formData);
			} else {
				this.uploadError("Upload avatar error: File is too big! Must be smaller than " + maxSizeUser, "");
			}

		});
	}

	/**
	 * Post a new avatar image
	 */
	public postAvatar(formData: any) {

		this.APIService.post(this.username + "/avatar", formData, {"Content-Type": undefined})
			.then((res) => {
				this.uploadingAvatar = false;

				if (res.status === 200) {

					this.avatarUrl = this.getAvatarUrl();

				} else {
					this.uploadError("Upload avatar error", res.data);
				}
			})
			.catch((error) => {
				this.uploadError("Upload avatar error", error);
			});

	}

	/**
	 * Present a user with an error dialog when there is an error uploading a new avatar
	 */
	public uploadError(content, error) {
		this.uploadingAvatar = false;
		console.error(content, error);
		this.$mdDialog.show(
			this.$mdDialog.alert()
				.clickOutsideToClose(true)
				.title("Upload Avatar Error")
				.content(content)
				.ariaLabel("Upload Avatar Error")
				.ok("OK"),
		);
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
		loading: "=",
	},
	controller: AccountInfoController,
	controllerAs: "vm",
	templateUrl: "templates/account-info.html",
};

export const AccountInfoComponentModule = angular
	.module("3drepo")
	.component("accountInfo", AccountInfoComponent);
