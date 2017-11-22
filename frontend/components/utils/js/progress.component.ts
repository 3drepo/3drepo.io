/**
 *  Copyright (C) 2015 3D Repo Ltd
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

class TdrProgressController implements ng.IController {
	constructor() {
		var vm = this;
	}
}

export const TdrProgress: ng.IComponentOptions = {
	templateUrl: "templates/tdr-progress.html",
	bindings: {
		info: "="
	},
	controller: TdrProgressController,
	controllerAs: "vm"
}

export const TdrProgressModule = angular
	.module('3drepo')
	.component('tdrProgress', TdrProgress);