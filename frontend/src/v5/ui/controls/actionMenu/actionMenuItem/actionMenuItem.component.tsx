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
import {
	ActionMenuItemButton,
	ItemIcon,
	Link,
	MenuItem,
	ItemText,
} from './actionMenuItem.styles';

export const ACTION_MENU_ITEM_NAME = 'ActionMenuItem';

type ActionMenuItemProps = {
	className?: string;
	label?: string;
	Icon?: any;
	to?: string;
	children?: React.ReactNode;
	actionButton?: boolean;
	onClick?: () => void;
};

export const ActionMenuItem = ({
	children,
	to,
	Icon,
	actionButton,
	...props
}: ActionMenuItemProps) => (
	<MenuItem data-name="menuItem" {...props} button={!!actionButton}>
		{actionButton ? (
			<Link to={to}>
				<ActionMenuItemButton>
					{Icon && (
						<ItemIcon>
							<Icon />
						</ItemIcon>
					)}
					<ItemText>{children}</ItemText>
				</ActionMenuItemButton>
			</Link>
		) : (
			children
		)}
	</MenuItem>
);
