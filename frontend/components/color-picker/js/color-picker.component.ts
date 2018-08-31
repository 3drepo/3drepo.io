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

class ColorPickerController implements ng.IController {
	public static $inject: string[] = [];

	public $onInit(): void {}
}

export const ColorPickerComponent: ng.IComponentOptions = {
	bindings: {},
	controller: ColorPickerController,
	controllerAs: "vm",
	templateUrl: "templates/color-picker.html"
};

export const ColorPickerComponentModule = angular
	.module("3drepo")
	.component("colorPicker", ColorPickerComponent);
