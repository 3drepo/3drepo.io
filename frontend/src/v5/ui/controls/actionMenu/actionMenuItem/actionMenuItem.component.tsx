/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { Link, MenuItem, MenuItemContainer } from './actionMenuItem.styles';
import { ActionMenuItemButton } from './actionMenuItemButton/actionMenuItemButton.component';

export const ACTION_MENU_ITEM_NAME = 'ActionMenuItem';

type ActionMenuItemProps = {
	className?: string;
	label?: string;
	Icon?: any;
	to?: string;
	children?: React.ReactNode;
	onClick?: () => void;
};

export const ActionMenuItem = ({
	children,
	to,
	Icon,
	label,
	onClick,
	...props
}: ActionMenuItemProps) => (
	<MenuItemContainer onClick={onClick}>
		{children
			? <>{children}</>
			: (
				<MenuItem {...props} button>
					{to ? (
						<Link to={to}>
							<ActionMenuItemButton Icon={Icon} label={label} />
						</Link>
					) : (
						<ActionMenuItemButton Icon={Icon} label={label} />
					)}
				</MenuItem>
			)}
	</MenuItemContainer>
);
