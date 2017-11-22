/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the multiSelect of the GNU Affero General Public License as
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

export class MultiSelectService {

	keys = {
		cmdKey : 91,
		ctrlKey : 17,
		escKey : 27
	};

	isMac = (navigator.platform.indexOf("Mac") !== -1);
	multiMode = false;

	static $inject: string[] = [	
		"ViewerService"
	];

	constructor(
		public ViewerService: any, 
	) {}

	handleKeysDown(keysDown) {

		if (this.ViewerService.pin.pinDropMode) {
			return;
		}

		if (this.isMultiSelectDown(keysDown)) {

			this.multiSelectEnabled();

		} else if (this.multiMode === true && this.isOtherKey(keysDown)) {

			this.multiSelectDisabled();

		} else if (this.isEscapeKey(keysDown)) {

			this.unhighlightAll();

		}
			
	}

	isMultiMode() {
		return this.multiMode;
	}

	multiSelectEnabled() {
		this.multiMode = true;
		this.ViewerService.setMultiSelectMode(true);
	}

	multiSelectDisabled() {
		this.multiMode = false;
		this.ViewerService.setMultiSelectMode(false);
	}

	unhighlightAll() {
		this.ViewerService.highlightObjects([]);			
	}

	disableMultiSelect() {
		this.ViewerService.setMultiSelectMode(false);
	}

	isCmd(keysDown) {
		return this.isMac && keysDown.indexOf(this.keys.cmdKey) !== -1;
	}

	isCtrlKey(keysDown) {
		return !this.isMac && keysDown.indexOf(this.keys.ctrlKey) !== -1;
	}

	isMultiSelectDown(keysDown) {
		return this.isCmd(keysDown) || this.isCtrlKey(keysDown);
	}

	isOtherKey(keysDown) {
		var macOtherKey = this.isMac && keysDown.indexOf(this.keys.cmdKey) === -1;
		var otherKey = !this.isMac && keysDown.indexOf(this.keys.ctrlKey) === -1;
		return macOtherKey || otherKey;
	}

	isEscapeKey(keysDown) {
		keysDown.indexOf(this.keys.escKey) !== -1;
	}

}

export const MultiSelectServiceModule = angular
	.module("3drepo")
	.service("MultiSelectService", MultiSelectService);
