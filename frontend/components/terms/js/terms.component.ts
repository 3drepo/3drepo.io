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

class TermsController implements ng.IController {

	public static $inject: string[] = [
		"StateManager",
	];

	constructor(private StateManager) {}

	public $onInit() {}

	public home() {
		this.StateManager.goHome();
	}
}

export const TermsComponent: ng.IComponentOptions = {
	bindings: {},
	controller: TermsController,
	controllerAs: "vm",
	templateUrl: "templates/terms.html",
};

export const TermsComponentModule = angular
	.module("3drepo")
	.component("terms", TermsComponent);
