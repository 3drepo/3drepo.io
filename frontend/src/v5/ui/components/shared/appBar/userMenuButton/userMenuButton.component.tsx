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
import { MenuIcon, MenuItem, MenuText, Link } from './userMenuButton.styles';

type UserMenuButtonProps = {
	className?: string;
	label: string;
	Icon: any;
	to?: string;
	onClickClose: () => void;
};

export const UserMenuButton = ({ to, Icon, label, onClickClose, ...props }: UserMenuButtonProps) => (
	<Link to={to}>
		<MenuItem
			button
			{...props}
			onClick={onClickClose}
		>
			<MenuIcon>
				<Icon />
			</MenuIcon>
			<MenuText primary={label} />
		</MenuItem>
	</Link>
);
