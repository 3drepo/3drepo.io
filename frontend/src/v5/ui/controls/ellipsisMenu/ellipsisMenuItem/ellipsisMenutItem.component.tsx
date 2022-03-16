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
import { ReactNode, SyntheticEvent } from 'react';
import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { MenuItem } from './ellipsisMenuItem.styles';

type EllipsisMenuItemProps = {
	title: ReactNode;
	to?: any;
	key?: string;
	onClick?: (event: SyntheticEvent) => void;
};

export const EllipsisMenuItem = ({ to, title, key, onClick }: EllipsisMenuItemProps) =>
	(
		<MenuItem
			component={to ? Link : null}
			to={to}
			key={key}
			onClick={onClick}
		>
			<Typography variant="body1" noWrap>
				{title}
			</Typography>
		</MenuItem>
	);
