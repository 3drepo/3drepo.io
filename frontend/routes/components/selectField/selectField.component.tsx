/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import React from 'react';

import Select, { SelectProps } from '@material-ui/core/Select';
import { MuiTheme } from '../../../styles/theme';

function findLabel(children, value) {
	if (!Array.isArray(children )) {
		return children?.props?.value === value;
	}

	return children.find((c) => {
		return (Array.isArray(c)) ?  findLabel(c, value) : c.props.value === value;
	});
}

export class SelectField extends React.PureComponent<SelectProps, any> {
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

	public handleOpen = (menuWrapper, isAppearing) => {
		this.menuWrapper = menuWrapper;
		this.menuItems = Array.from(this.menuWrapper.querySelectorAll('[data-value]'));
		this.menuWrapper.addEventListener('keypress', this.handleKeyPress);
		this.menuWrapper.addEventListener('mousemove', this.handleMouseMove);

		if ((this.props.MenuProps || {}).onEntered) {
			this.props.MenuProps.onEntered(menuWrapper, isAppearing);
		}
	}

	public handleClose = (node) => {
		if (this.menuWrapper) {
			this.menuWrapper.removeEventListener('keypress', this.handleKeyPress);
			this.menuWrapper.removeEventListener('mousemove', this.handleMouseMove);
		}
		this.menuItems = null;
		this.menuWrapper = null;
		this.selectedItem = null;

		if ((this.props.MenuProps || {}).onExit) {
			this.props.MenuProps.onExit(node);
		}
	}

	public render() {
		const { MenuProps, children, onOpen, className, ...selectProps } = this.props;

		const customMenuProps = {
			...MenuProps,
			onEntered: this.handleOpen,
			onExit: this.handleClose
		};

		const hasLabel = Boolean(findLabel(this.props.children, selectProps.value));
		const renderValue = this.props.renderValue || (hasLabel ? null : (value) => value);
		return (
			<Select
				className={className}
				{...selectProps}
				MenuProps={customMenuProps} displayEmpty
				renderValue={renderValue}>
				{children}
			</Select>
		);
	}
}
