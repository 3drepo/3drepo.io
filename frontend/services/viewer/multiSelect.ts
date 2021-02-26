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

import { Viewer } from './viewer';

const SHIFT_KEY = 16;
const CTRL_KEY = 17;
const ALT_KEY = 18;
const COMMAND_CHROME_KEY = 91;
const COMMAND_FF_KEY = 224;

export class MultiSelectService {
	private isMac = (navigator.platform.indexOf('Mac') !== -1);
	private accumMode = false;
	private decumMode = false;
	private areaSelectMode = false;

	private cursorIcons = {
		accumMode: 'url(./icons/cursor_add.png), auto',
		decumMode: 'url(./icons/cursor_del.png), auto',
		areaMode: 'url(./icons/cursor_rect.png), auto',
		areaAccumMode: 'url(./icons/cursor_rect_add.png), auto',
		areaDecumMode: 'url(./icons/cursor_rect_del.png), auto',
		noneCanvas: 'default',
		nonePanel: 'pointer'
	};

	public initKeyWatchers() {
		document.addEventListener('keydown', this.keyDownHandler);
		document.addEventListener('keyup', this.keyUpHandler);
	}

	public removeKeyWatchers() {
		document.removeEventListener('keydown', this.keyDownHandler);
		document.removeEventListener('keyup', this.keyUpHandler);
	}

	public keyDownHandler = (event) => {
		this.handleKey(event.which, true);
	}

	public keyUpHandler = (event) => {
		this.handleKey(event.which, false);
	}

	public handleKey(key: number, keyDown: boolean) {
		switch (key) {
			case SHIFT_KEY:
				this.toggleAreaSelect(keyDown);
				break;
			case CTRL_KEY:
				if (!this.isMac) {
					this.setAccumMode(keyDown);
				}
				break;
			case ALT_KEY:
				this.setDecumMode(keyDown);
				break;
			case COMMAND_CHROME_KEY:
			case COMMAND_FF_KEY:
				if (this.isMac) {
					this.setAccumMode(keyDown);
				}
				break;
		}
	}

	public isAccumMode() {
		return this.accumMode;
	}

	public isDecumMode() {
		return this.decumMode;
	}

	public toggleAreaSelect(on: boolean) {
		if (this.areaSelectMode !== on) {
			this.areaSelectMode = on;
			if (on) {
				Viewer.startAreaSelect();
			} else {
				Viewer.stopAreaSelect();
			}
			this.determineCursorIcon();
		}
	}

	private determineCursorIcon() {
		let canvasIcon = this.cursorIcons.noneCanvas;
		let panelIcon = this.cursorIcons.nonePanel;
		if (this.areaSelectMode) {
			if (this.accumMode) {
				canvasIcon = this.cursorIcons.areaAccumMode;
				panelIcon = this.cursorIcons.accumMode;
			} else if (this.decumMode) {
				canvasIcon = this.cursorIcons.areaDecumMode;
				panelIcon = this.cursorIcons.decumMode;
			} else {
				canvasIcon = this.cursorIcons.areaMode;
			}
		} else if (this.accumMode) {
			canvasIcon = panelIcon = this.cursorIcons.accumMode;
		} else if (this.decumMode) {
			canvasIcon = panelIcon = this.cursorIcons.decumMode;
		}

		if (document.getElementById('unityViewer')) {
			document.getElementById('unityViewer').style.cursor = canvasIcon;
		}

		const groupElements: any = document.getElementsByClassName('groups-list');
		for (let i = 0; i < groupElements.length; ++i) {
			groupElements[i].style.cursor = panelIcon;
		}

		const treeNodeElements: any = document.getElementsByClassName('tree-list');
		for (let i = 0; i < treeNodeElements.length; ++i) {
			treeNodeElements[i].style.cursor = panelIcon;
		}
	}

	private setAccumMode(on: boolean) {
		if (this.accumMode !== on) {
			this.accumMode = on;
			this.decumMode = on ? false : this.decumMode;
			this.determineCursorIcon();
		}
	}

	private setDecumMode(on: boolean) {
		if (this.decumMode !== on) {
			this.decumMode = on;
			this.accumMode = on ? false : this.accumMode;
			this.determineCursorIcon();
		}
	}
}

export const MultiSelect = new MultiSelectService();
