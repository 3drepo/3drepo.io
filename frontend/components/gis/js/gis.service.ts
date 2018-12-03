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
		'APIService',
		'ViewerService'
	];

	private initialised: boolean;
	private visibleSources: Set<string>;

	constructor(
		private APIService: any,
		private ViewerService: any
	) {
		this.initialised = false;
		this.visibleSources = new Set();
	}

	public getProviders(account: string, model: string) {
		const listMapsUrl = `${account}/${model}/maps/`;
		return this.APIService.get(listMapsUrl)
			.then((response) => {
				const mapProviders = response.data.maps;
				if (mapProviders && mapProviders.length > 0) {
					mapProviders.forEach((mapProvider) => {
						if (mapProvider.layers && mapProvider.layers.length > 0) {
							mapProvider.layers.forEach((mapLayer) => {
								mapLayer.visibility = 'invisible';
							});
						}
					});
				}
				return mapProviders;
			});
	}

	public resetMapSources() {
		this.visibleSources.clear();
		this.ViewerService.resetMapSources();
		this.ViewerService.mapStop();
	}

	public addMapSource(source) {
		if (!this.visibleSources.has(source)) {
			this.ViewerService.addMapSource(source);
			if (this.visibleSources.size === 0) {
				this.mapStart();
			}
			this.visibleSources.add(source);
		}
	}

	public removeMapSource(source) {
		if (this.visibleSources.delete(source)) {
			this.ViewerService.removeMapSource(source);
			if (this.visibleSources.size === 0) {
				this.mapStop();
			}
		}
	}

	public mapInitialise(params) {
		if (params && params.surveyPoints.length) {
			if (params.surveyPoints[0].latLong && params.surveyPoints[0].position) {
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
		layer.visibility = (layer.visibility === 'visible') ? 'invisible' : 'visible';

		if (layer.visibility === 'visible') {
			this.addMapSource(layer.source);
		} else {
			this.removeMapSource(layer.source);
		}

	}

}

export const GISServiceModule = angular
	.module('3drepo')
	.service('GISService', GISService);
