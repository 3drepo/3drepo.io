import { IController } from "angular";

/**
 *	Copyright (C) 2014 3D Repo Ltd
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

class ViewerController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$q",
		"$element",
		"$timeout",

		"ClientConfigService",
		"EventService",
		"ViewerService",
	];

	private account: any;
	private model: any;
	private branch: string;
	private revision: string;
	private pointerEvents: string;
	private measureMode: boolean;
	private viewer: any;

	constructor(
		private $scope: ng.IScope,
		private $q: ng.IQProvider,
		private $element: ng.IRootElementService,
		private $timeout: ng.ITimeoutService,

		private ClientConfigService,
		private EventService,
		private ViewerService,
	) {

		$scope.$watch(() => {
			return ViewerService.pin;
		}, () => {
			this.viewer.setPinDropMode(ViewerService.pin.pinDropMode);
		}, true);

		$scope.$watch(EventService.currentEvent, (event: any) => {
			const validEvent = event !== undefined && event.type !== undefined;

			if (validEvent && ViewerService.initialised) {
				ViewerService.handleEvent(event, this.account, this.model);
			}
		});

	}

	public $onInit() {
		console.log("Viewer initialised...");

		this.branch   = this.branch ? this.branch : "master";
		this.revision = this.revision ? this.revision : "head";

		this.pointerEvents = "auto";
		this.measureMode = false;

		this.viewer = this.ViewerService.getViewer();

	}

	public $onDestroy() {
		this.$element.on("$destroy", () => {
			this.ViewerService.diffToolDisableAndClear();
			this.viewer.reset(); // Remove events watch
		});
	}

}

export const ViewerComponent: ng.IComponentOptions = {
		bindings: {
			account: "<",
			branch: "<",
			model: "<",
			revision: "<",
		},
		controller: ViewerController,
		controllerAs: "vm",
};

export const ViewerComponentModule = angular
	.module("3drepo")
	.component("viewer", ViewerComponent);
