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
import React, { Dispatch, ReactNode } from 'react';
import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { MenuItem } from './ellipsisMenuItem.styles';

interface IEllipsisMenuItem {
	title: ReactNode;
	to?: string;
	handleClose: () => void;
	onClick?: Dispatch<void>;
}

export const EllipsisMenuItem = ({ to, title, onClick, handleClose }: IEllipsisMenuItem) => (
	<MenuItem
		component={to ? Link : null}
		to={to}
		onClick={(event) => {
			event.stopPropagation();
			onClick?.call(event);
			handleClose();
		}}
	>
		<Typography variant="body1" noWrap>
			{title}
		</Typography>
	</MenuItem>
);
