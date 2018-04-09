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
		"$document",
	];

	private keys = {
		cmdKey : 91,
		ctrlKey : 17,
		escKey : 27,
	};

	private isMac = (navigator.platform.indexOf("Mac") !== -1);
	private multiMode = false;
	private keysDown: number[] = [];

	constructor(
		public ViewerService: any,
		public $document: any,
	) {

		this.initKeyWatchers();

	}

	public initKeyWatchers() {

		this.$document.bind("keydown", (event) => {
			if (this.keysDown.indexOf(event.which) === -1) {

				this.keysDown.push(event.which);

				// Recreate list so that it changes are registered in components
				this.keysDown = this.keysDown.slice();

			}

			this.handleKeysDown(this.keysDown);

		});

		this.$document.bind("keyup", (event) => {
			// Remove all instances of the key (multiple instances can happen if key up wasn't registered)
			for (let i = (this.keysDown.length - 1); i >= 0; i -= 1) {
				if (this.keysDown[i] === event.which) {
					this.keysDown.splice(i, 1);
				}
			}

			// Recreate list so that it changes are registered in components
			this.keysDown = this.keysDown.slice();

			this.handleKeysDown(this.keysDown);

		});

	}

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
		console.log("multiSelectEnabled")
		this.multiMode = true;
		this.ViewerService.setMultiSelectMode(true);
	}

	public multiSelectDisabled() {
		console.log("multiSelectDisabled")
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
