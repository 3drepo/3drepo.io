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

// TODO - TO REMOVE

declare const Viewer: any;

export class ViewerService {

	public static $inject: string[] = [
		'$q',
		'$timeout',

		'ClientConfigService'
	];

	public pin: any;
	public newPinId: string;
	public currentModel: any;
	public initialised: any;
	public currentModelInit: any;

	private pinData: any;
	private viewer: any;
	private Viewer: any;
	private model: string;
	private account: string;
	private heliSpeed: number = 1;

	private stats: boolean = false;

}

export const ViewerServiceModule = angular
	.module('3drepo')
	.service('ViewerService', ViewerService);
