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

import React, { Dispatch, ReactNode } from 'react';
import { Typography } from '@material-ui/core';
import { MenuList, MenuItem } from './ellipsisMenu.styles';

interface IListItem {
	title: ReactNode;
	onClick: Dispatch<void>;
}

export interface IEllipsisMenu {
	anchorEl: null | HTMLElement;
	handleClose: () => void;
	list: IListItem[];
}

export const EllipsisMenu = ({ anchorEl, handleClose, list }: IEllipsisMenu): JSX.Element => {
	const menuPosition = {
		getContentAnchorEl: null,
		anchorOrigin: {
			vertical: 'bottom',
			horizontal: 'right',
		},
		transformOrigin: {
			vertical: 'top',
			horizontal: 'right',
		},
	};

	return (
		<MenuList
			anchorEl={anchorEl}
			onClose={(event) => {
				event.stopPropagation();
				handleClose();
			}}
			open={Boolean(anchorEl)}
			{...menuPosition}
		>
			{list.map(({ title, onClick }) => (
				<MenuItem
					onClick={(event) => {
						event.stopPropagation();
						onClick(event);
						handleClose();
					}}
				>
					<Typography variant="body1" noWrap>
						{title}
					</Typography>
				</MenuItem>
			))}
		</MenuList>
	);
};
