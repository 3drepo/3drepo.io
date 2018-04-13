/**
 *  Copyright (C) 2017 3D Repo Ltd
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

export class SWService {

	public static $inject: string[] = [
		"DialogService",
		"ClientConfigService",
	];

	private sw: string;
	private path: string;
	private newVersionDialogOpen: boolean;

	constructor(
		private DialogService: any,
		private ClientConfigService: any,
	) {
		this.path = "/";
		this.newVersionDialogOpen = false;
		this.sw = "service-worker"; // The name of the service worker

	}

	public init() {
		if ("serviceWorker" in navigator) {
			this.registerSW(this.sw);
		}
	}

	public debugSW(message) {
		console.debug("ServiceWorker (" + this.sw + ") - " + message);
	}

	public registerSW(sw)  {

		const swPath = this.path + sw + ".js";

		this.debugSW("path: " + swPath);

		navigator.serviceWorker.register(swPath).then(
			(registration) => {

				// Registration was successful
				this.debugSW("registration successful: " + registration);

				registration.onupdatefound = () => {
					this.debugSW("onupdatefound fired" + registration);
					this.handleSWRegistration(registration);
				};

				if (typeof registration.update === "function") {
					this.debugSW("updating Service Worker...");
					registration.update();
				}

			},
			(err) => {
				// registration failed :(
				this.debugSW("registration failed: " + err);
			},
		);

	}

	public handleSWRegistration(registration) {

		this.debugSW("calling handleSWRegistration asdas");

		if (registration.waiting) {
			this.debugSW("waiting " + registration.waiting);
			registration.waiting.onstatechange = this.onStateChange("waiting");
		}

		if (registration.installing) {
			this.debugSW("installing " + registration.installing);
			registration.installing.onstatechange = this.onStateChange("installing");
		}

		if (registration.active) {
			this.debugSW("active " + registration.active);
			registration.active.onstatechange = this.onStateChange("active");
		}
	}

	public onStateChange(from) {
		return (event) => {
			this.debugSW("statechange " + from + " to " + event.target.state);
			if (from === "installing" && event.target.state === "activated") {
				this.showDialog();
			}
		};
	}

	public showDialog() {

		if (this.ClientConfigService && this.ClientConfigService.maintenanceMode === true) {
			location.reload();
		}

		if (!this.newVersionDialogOpen) {
			this.newVersionDialogOpen = true;
			setTimeout(() => {
				this.DialogService.newUpdate();
			}, 500);
		}

	}

}

export const SWServiceModule = angular
	.module("3drepo")
	.service("SWService", SWService);
