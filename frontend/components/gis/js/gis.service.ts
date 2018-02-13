/**
 *	Copyright (C) 2017 3D Repo Ltd
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

export class GISService {

	public static $inject: string[] = [
		"ViewerService",
	];

	private initialised: boolean;

	constructor(
		private ViewerService: any,
	) {
		this.initialised = false;
	}

	public getProviders() {
		return [
			{
				name: "Open Street Map",
				layers: [
					{
						name: "Map Tiles",
						visibility: "invisible",
					},
				],
			},
		];
	}

	public mapInitialise(params) {
		if (!this.initialised && params && params.surveyPoints.length) {
			if (params.surveyPoints[0].latLong && params.surveyPoints[0].position) {

				console.log("mapInitialise", params);
				this.ViewerService.mapInitialise(params);
				this.initialised = true;
			}
		}
	}

	public mapStart() {
		if (this.initialised) {
			this.ViewerService.mapStart();
		}
	}

	public mapStop() {
		if (this.initialised) {
			this.ViewerService.mapStop();
		}
	}

	public toggleLayerVisibility(layer: any) {
		layer.visibility = (layer.visibility === "visible") ? "invisible" : "visible";

		if (layer.visibility === "visible") {
			this.mapStart();
		} else {
			this.mapStop();
		}

	}

}

export const GISServiceModule = angular
	.module("3drepo")
	.service("GISService", GISService);
