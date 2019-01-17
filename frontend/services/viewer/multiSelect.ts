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

	constructor() {
		this.initKeyWatchers();
	}

	public initKeyWatchers() {
		document.addEventListener('keydown', (event) => {
			this.handleKey(event.which, true);
		});

		document.addEventListener('keyup', (event) => {
			this.handleKey(event.which, false);
		});
	}

	public handleKey(key: number, keyDown: boolean) {
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
			case 224:
				// Command key(Mac)
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

		if (document.getElementById('#canvas')) {
			document.getElementById('#canvas').style.cursor = canvasIcon;
		}

		const groupElements: any = document.getElementsByClassName('groupsList');
		for (let i = 0; i < groupElements.length; ++i) {
			groupElements[i].style.cursor = panelIcon;
		}

		const treeNodeElements: any = document.getElementsByClassName('treeNode');
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
