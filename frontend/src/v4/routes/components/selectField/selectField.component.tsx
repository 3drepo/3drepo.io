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

import Select, { SelectProps } from '@mui/material/Select';
import { MuiTheme } from '../../../styles/theme';

function findLabel(children, value) {
	if (!Array.isArray(children )) {
		return children?.props?.value === value;
	}

	return children.find((c) => {
		return (Array.isArray(c)) ?  findLabel(c, value) : c.props.value === value;
	});
}

export const SelectField = ({
	MenuProps,
	children,
	onOpen,
	className,
	renderValue: renderValueProp,
	...selectProps
}: SelectProps) => {
	let menuWrapper;
	let menuItems;
	let query = '';
	let searchTimeout;
	let selectedItem;

	const findMenuItem = (pressedKey) => {
		return menuItems.find((item) => {
			return item.innerText.toLowerCase().startsWith(pressedKey.toLowerCase());
		});
	}

	const focusOnItem = (newSelectedItem) => {
		newSelectedItem.focus();
		newSelectedItem.style.backgroundColor = MuiTheme.palette.action.hover;
		newSelectedItem.tabindex = 0;

		const scrollTop = newSelectedItem.offsetTop;
		menuWrapper.scrollTop = scrollTop;
		selectedItem = newSelectedItem;
	}

	const blurItem = (newSelectedItem) => {
		if (newSelectedItem) {
			newSelectedItem.style.backgroundColor = '';
			selectedItem = null;
		}
	}

	const handleMouseMove = () => {
		blurItem(selectedItem);
	}

	const handleKeyPress = (event) => {
		clearTimeout(searchTimeout);
		blurItem(selectedItem);

		const { key: pressedKey } = event;
		if (pressedKey.length === 1) {
			query += pressedKey;

			const currentItem = menuWrapper.querySelector('[tabindex="0"]');
			const selectedMenuItem = findMenuItem(query);

			if (selectedMenuItem) {
				event.preventDefault();

				if (currentItem) {
					currentItem.tabindex = -1;
				}

				focusOnItem(selectedMenuItem);
			}

			searchTimeout = setTimeout(() => {
				query = '';
			}, 220);
		}
	}

	const handleOpen = (newMenuWrapper, isAppearing) => {
		menuWrapper = newMenuWrapper;
		menuItems = Array.from(menuWrapper.querySelectorAll('[data-value]'));
		newMenuWrapper.addEventListener('keypress', handleKeyPress);
		newMenuWrapper.addEventListener('mousemove', handleMouseMove);

		if (MenuProps?.TransitionProps?.onEntered) {
			MenuProps.TransitionProps.onEntered(newMenuWrapper, isAppearing);
		}
	}

	const handleClose = (node) => {
		if (menuWrapper) {
			menuWrapper.removeEventListener('keypress', handleKeyPress);
			menuWrapper.removeEventListener('mousemove', handleMouseMove);
		}
		menuItems = null;
		menuWrapper = null;
		selectedItem = null;

		if (MenuProps?.TransitionProps?.onExit) {
			MenuProps.TransitionProps.onExit(node);
		}
	}
	const customMenuProps = {
		...MenuProps,
		TransitionProps: {
			...MenuProps?.TransitionProps,
			onEntered: handleOpen,
			onExit: handleClose
		}
	};

	const hasLabel = Boolean(findLabel(children, selectProps.value));
	const renderValue = renderValueProp || (hasLabel ? null : (value) => value);
	return (
		<Select
			className={className}
			{...selectProps}
			MenuProps={customMenuProps}
			displayEmpty
			renderValue={renderValue}>
			{children}
		</Select>
	);
};
