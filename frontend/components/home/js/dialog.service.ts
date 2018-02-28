/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export class DialogService {

	public static $inject: string[] = [
		"$mdDialog",
	];

	private expiredDialogOpen;
	private disconnectedDialogOpen;
	private disconnectDialogLastOpen;
	private muteNotifications;
	private thirtySeconds;

	constructor(
		private $mdDialog,
	) {
		this.expiredDialogOpen = false;
		this.disconnectedDialogOpen = false;
		this.muteNotifications = false;
		this.thirtySeconds = 30 * 1000; /* ms */
	}

	public disconnected() {

		let greaterThanThirtySeconds = true;

		if (this.disconnectDialogLastOpen !== undefined) {
			greaterThanThirtySeconds = ((Date.now()) - this.disconnectDialogLastOpen) > this.thirtySeconds;
		}

		if (greaterThanThirtySeconds === false) {
			return;
		}

		if (this.muteNotifications === true) {
			return;
		}

		if (this.disconnectedDialogOpen === true) {
			console.debug("Notifications - Disconnect dialog currently open");
			return;
		}

		const title = "Notification Service Disconnected";
		const content = "Your connection to the 3D Repo's notification service has dropped. " +
		"3D Repo may not behave as expected when commenting and changing issues. Try refreshing the page" +
		" to reconnect.";
		const escapable = true;

		// Opening the dialog
		this.disconnectedDialogOpen = true;
		this.disconnectDialogLastOpen = Date.now();

		return this.$mdDialog.show(
			this.$mdDialog.confirm()
				.clickOutsideToClose(escapable)
				.escapeToClose(escapable)
				.title(title)
				.htmlContent(content)
				.ariaLabel(title)
				.ok("Continue")
				.cancel("Mute Notifications"),
		)
			.then(() => {
				this.disconnectedDialogOpen = false;
			})
			.catch(() => {
				console.log("Notifications - Muting notifications");
				this.disconnectedDialogOpen = false;
				this.muteNotifications = true;
			});

	}

	public isDefined(variable) {
		return variable !== null && variable !== undefined;
	}

	public cancel() {
		this.$mdDialog.cancel();
	}

	public showDialog(
		dialogTemplate, scope, event, clickOutsideToClose, parent, fullscreen, closeTo,
	) {

		// Allow the dialog to have cancel ability
		scope.utilsRemoveDialog = scope.utilsRemoveDialog || this.cancel;

		// Set up and show dialog
		const data: any = {
			controller: () => {},
			templateUrl: "/templates/" + dialogTemplate,
			onRemoving: () => {
				this.$mdDialog.cancel();
			},
		};

		data.parent = angular.element(this.isDefined(parent) ? parent : document.body);

		data.scope = (this.isDefined(scope)) ? scope : null;
		data.preserveScope = (data.scope !== null);
		data.targetEvent = (this.isDefined(event)) ? event : null;
		data.clickOutsideToClose = (this.isDefined(clickOutsideToClose)) ? clickOutsideToClose : true;
		data.fullscreen = (this.isDefined(fullscreen)) ? fullscreen : false;
		data.closeTo = (this.isDefined(closeTo)) ? closeTo : false;
		this.$mdDialog.show(data);
	}

	/**
	 * close a dialog
	 */
	public closeDialog() {
		this.$mdDialog.cancel();
	}

	public sessionExpired() {

		if (!this.expiredDialogOpen) {

			this.expiredDialogOpen = true;
			const content = "You have been logged out as your session has expired.";
			return this.$mdDialog.show(
				this.$mdDialog.alert()
					.clickOutsideToClose(false)
					.escapeToClose(false)
					.title("Session Expired")
					.textContent(content)
					.ariaLabel("Session Expired")
					.ok("OK"),
			).then(() => {
				this.expiredDialogOpen = false;
			});

		} else {
			return Promise.resolve();
		}

	}

	public text(title, content, escapable) {

		if (!this.expiredDialogOpen) {

			if (escapable === undefined) {
				escapable = true;
			}

			return this.$mdDialog.show(
				this.$mdDialog.alert()
					.clickOutsideToClose(escapable)
					.escapeToClose(escapable)
					.title(title)
					.textContent(content)
					.ariaLabel(title)
					.ok("OK"),
			);

		} else {
			return Promise.resolve();
		}

	}

	public html(title, content, escapable) {

		if (!this.expiredDialogOpen) {

			if (escapable === undefined) {
				escapable = true;
			}

			return this.$mdDialog.show(
				this.$mdDialog.alert()
					.clickOutsideToClose(escapable)
					.escapeToClose(escapable)
					.title(title)
					.htmlContent(content)
					.ariaLabel(title)
					.ok("OK"),
			);
		} else {
			return Promise.resolve();
		}

	}

	public newUpdate() {

		const title = "Update Available";
		const content = `A new version of 3D Repo is available! <br> <br>
			Please reload the page for the latest version. See the latest changelog
			<a href='https://github.com/3drepo/3drepo.io/releases/latest'>here</a>.`;

		let escapable = false;

		if (escapable === undefined) {
			escapable = true;
		}

		return this.$mdDialog.show(
			this.$mdDialog.confirm()
				.clickOutsideToClose(escapable)
				.escapeToClose(escapable)
				.title(title)
				.htmlContent(content)
				.ariaLabel(title)
				.ok("Reload")
				.cancel("I'll reload in a moment"),
		)
			.then(() => {
				window.location.reload();
			})
			.catch(() => {
				console.log("User didn't reload");
			});

	}

}

export const DialogServiceModule = angular
	.module("3drepo")
	.service("DialogService", DialogService);
