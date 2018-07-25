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

	private isMac = (navigator.platform.indexOf("Mac") !== -1);
	private accumMode = false;
	private decumMode = false;
	private areaSelectMode = false;

	private cursorIcons = {
		accumMode : "copy",
		decumMode : "alias",
		areaMode  : "crosshair",
		none      : "default"
	};

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

		switch (key) {
			case 16:
				// Shift
				this.toggleAreaSelect(keyDown);
				break;
			case 17:
				// Ctrl
				if (!this.isMac) {
					this.setAccumMode(keyDown);
				}
				break;
			case 18:
				// Alt
				this.setDecumMode(keyDown);
				break;
			case 91:
				// Command key(Mac)
				if (this.isMac) {
					this.setAccumMode(keyDown);
				}
				break;
		}
		this.determineCursorIcon();
	}

	public isMultiMode() {
		return this.isAccumMode();
	}

	public isAccumMode() {
		// isMultiMode() {
		return this.accumMode;
	}

	public isDecumMode() {
		return this.decumMode;
	}

	private determineCursorIcon() {
		let icon = this.cursorIcons.none;
		if (this.areaSelectMode) {
			icon = this.cursorIcons.areaMode;
		} else if (this.accumMode) {
			icon = this.cursorIcons.accumMode;
		} else if (this.decumMode) {
			icon = this.cursorIcons.decumMode;
		}

		document.getElementById("#canvas").style.cursor = icon;
	}

	private setAccumMode(on: boolean) {
		this.accumMode = on;
		this.decumMode = on ? false : this.decumMode;
	}

	private setDecumMode(on: boolean) {
		this.decumMode = on;
		this.accumMode = on ? false : this.accumMode;
	}

	private toggleAreaSelect(on: boolean) {
		if (this.areaSelectMode !== on) {
			this.areaSelectMode = on;
			if (on) {
				this.ViewerService.startAreaSelect();
			} else {
				this.ViewerService.stopAreaSelect();
			}
		}
	}
}

export const MultiSelectServiceModule = angular
	.module("3drepo")
	.service("MultiSelectService", MultiSelectService);
