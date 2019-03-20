/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import * as React from 'react';

import Select from '@material-ui/core/Select';
import { MuiTheme } from '../../../styles/theme';

export class SelectField extends React.PureComponent<any, any> {
	public menuWrapper;
	public menuItems;
	public query = '';
	public searchTimeout;
	public selectedItem;

	public findMenuItem = (pressedKey) => {
		return this.menuItems.find((item) => {
			return item.innerText.toLowerCase().startsWith(pressedKey.toLowerCase());
		});
	}

	public focusOnItem = (selectedItem) => {
		selectedItem.focus();
		selectedItem.style.backgroundColor = MuiTheme.palette.action.hover;
		selectedItem.tabindex = 0;

		const scrollTop = selectedItem.offsetTop;
		this.menuWrapper.scrollTop = scrollTop;
		this.selectedItem = selectedItem;
	}

	public blurItem = (selectedItem) => {
		if (selectedItem) {
			selectedItem.style.backgroundColor = '';
			selectedItem = null;
		}
	}

	public handleMouseMove = () => {
		this.blurItem(this.selectedItem);
	}

	public handleKeyPress = (event) => {
		clearTimeout(this.searchTimeout);
		this.blurItem(this.selectedItem);

		const { key: pressedKey } = event;
		if (pressedKey.length === 1) {
			this.query += pressedKey;

			const currentItem = this.menuWrapper.querySelector('[tabindex="0"]');
			const selectedItem = this.findMenuItem(this.query);

			if (selectedItem) {
				event.preventDefault();

				if (currentItem) {
					currentItem.tabindex = -1;
				}

				this.focusOnItem(selectedItem);
			}

			this.searchTimeout = setTimeout(() => {
				this.query = '';
			}, 220);
		}
	}

	public handleOpen = (menuWrapper) => {
		this.menuWrapper = menuWrapper;
		this.menuItems = Array.from(this.menuWrapper.querySelectorAll('[data-value]'));
		this.menuWrapper.addEventListener('keypress', this.handleKeyPress);
		this.menuWrapper.addEventListener('mousemove', this.handleMouseMove);
	}

	public handleClose = () => {
		if (this.menuWrapper) {
			this.menuWrapper.removeEventListener('keypress', this.handleKeyPress);
			this.menuWrapper.removeEventListener('mousemove', this.handleMouseMove);
		}
		this.menuItems = null;
		this.menuWrapper = null;
		this.selectedItem = null;
	}

	public render() {
		const { MenuProps, children, onOpen, className, ...selectProps } = this.props;

		const customMenuProps = {
			...MenuProps,
			onEntered: this.handleOpen,
			onExit: this.handleClose
		};

		return (
			<Select className={className} {...selectProps} MenuProps={customMenuProps}>
				{children}
			</Select>
		);
	}
}
