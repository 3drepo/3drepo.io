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

	public static $inject: string[] = [
		"ViewerService",
	];

	private keys = {
		cmdKey : 91,
		ctrlKey : 17,
		escKey : 27,
	};

	private isMac = (navigator.platform.indexOf("Mac") !== -1);
	private multiMode = false;

	constructor(
		public ViewerService: any,
	) {}

	public handleKeysDown(keysDown: any[]) {

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

	public isMultiMode() {
		return this.multiMode;
	}

	public multiSelectEnabled() {
		this.multiMode = true;
		this.ViewerService.setMultiSelectMode(true);
	}

	public multiSelectDisabled() {
		this.multiMode = false;
		this.ViewerService.setMultiSelectMode(false);
	}

	public unhighlightAll() {
		this.ViewerService.highlightObjects([]);
	}

	public disableMultiSelect() {
		this.ViewerService.setMultiSelectMode(false);
	}

	public isCmd(keysDown: any[]) {
		return this.isMac && keysDown.indexOf(this.keys.cmdKey) !== -1;
	}

	public isCtrlKey(keysDown: any[]) {
		return !this.isMac && keysDown.indexOf(this.keys.ctrlKey) !== -1;
	}

	public isMultiSelectDown(keysDown: any[]) {
		return this.isCmd(keysDown) || this.isCtrlKey(keysDown);
	}

	public isOtherKey(keysDown: any[]) {
		const macOtherKey = this.isMac && keysDown.indexOf(this.keys.cmdKey) === -1;
		const otherKey = !this.isMac && keysDown.indexOf(this.keys.ctrlKey) === -1;
		return macOtherKey || otherKey;
	}

	public isEscapeKey(keysDown: any[]) {
		return keysDown.indexOf(this.keys.escKey) !== -1;
	}

}

export const MultiSelectServiceModule = angular
	.module("3drepo")
	.service("MultiSelectService", MultiSelectService);
