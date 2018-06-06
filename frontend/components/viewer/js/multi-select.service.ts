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
		"$document"
	];

	private keys = {
		cmdKey : 91,
		ctrlKey : 17,
		escKey : 27
		shiftKey : 16
	};

	private isMac = (navigator.platform.indexOf("Mac") !== -1);
	private multiMode = false;
	private areaSelectMode = false;

	constructor(
		public ViewerService: any,
		public $document: any
	) {

		this.initKeyWatchers();

	}

	public initKeyWatchers() {

		this.$document.bind("keydown", (event) => {
			this.handleKey(event.which, true);
		});

		this.$document.bind("keyup", (event) => {
			this.handleKey(event.which, false);
		});

	}

	public handleKey(key: number, keyDown: boolean) {
		if (this.ViewerService.pin.pinDropMode) {
			return;
		}

		if (this.isMultiSelectDown(key)) {
			this.toggleMultiSelect(keyDown);
		} else if (this.isShiftKey(key)) {
			this.toggleAreaSelect(keyDown);
		}
	}

	public isMultiMode() {
		return this.multiMode;
	}

	public toggleMultiSelect(on: boolean) {
		if (this.multiMode !== on) {
			this.multiMode = on;
			this.ViewerService.setMultiSelectMode(on);
		}
	}

	public toggleAreaSelect(on: boolean) {
		if (this.areaSelectMode !== on) {
			this.areaSelectMode = on;
			if (on) {
				this.ViewerService.startAreaSelect();
			} else {
				this.ViewerService.stopAreaSelect();
			}
		}
	}

	public isCmd(key: number) {
		return this.isMac && this.keys.cmdKey === key;
	}

	public isCtrlKey(key: number) {
		return !this.isMac && this.keys.ctrlKey === key;
	}

	public isMultiSelectDown(key: number) {
		return this.isCmd(key) || this.isCtrlKey(key);
	}

	public isShiftKey(key: number) {
		return this.keys.shiftKey === key;
	}

}

export const MultiSelectServiceModule = angular
	.module("3drepo")
	.service("MultiSelectService", MultiSelectService);
