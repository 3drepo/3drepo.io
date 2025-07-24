/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { MenuList, MenuItem } from './breadcrumbDropdownstyles';

import type { JSX } from "react";

export interface BreadcrumbItem {
	title: string;
	to?: string;
	selected?: boolean;
	disabled?: boolean;
}

interface INavigationMenu {
	anchorEl: null | HTMLElement;
	handleClose: () => void;
	options: BreadcrumbItem[];
	open: boolean;
}

export const BreadcrumbDropdown = ({
	anchorEl, handleClose, options, open,
}: INavigationMenu): JSX.Element => (
	<MenuList
		anchorEl={anchorEl}
		onClose={handleClose}
		open={open && !!anchorEl}
		anchorOrigin={{
			vertical: 'bottom',
			horizontal: 'left',
		}}
		transformOrigin={{
			vertical: 'top',
			horizontal: 'left',
		}}
	>
		{options.map(({ title, to, selected, disabled }) => (
			<MenuItem
				key={title}
				to={to}
				onClick={handleClose}
				selected={selected}
				disabled={disabled}
			>
				{title}
			</MenuItem>
		))}
	</MenuList>
);
