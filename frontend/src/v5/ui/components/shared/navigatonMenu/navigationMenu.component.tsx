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

import React from 'react';
import { Typography } from '@material-ui/core';
import { MenuList, MenuItem } from './navigationMenu.styles';
import { useParams } from 'react-router-dom';

interface IListItem {
	title: string;
	to: string;
}

interface INavigationMenu {
	anchorEl: null | HTMLElement;
	handleClose: () => void;
	list: IListItem[];
}

export const NavigationMenu = ({ anchorEl, handleClose, list }: INavigationMenu): JSX.Element => {
	const menuPosition = {
		getContentAnchorEl: null,
		anchorOrigin: {
			vertical: 'bottom',
			horizontal: 'left',
		},
		transformOrigin: {
			vertical: 'top',
			horizontal: 'left',
		},
	};
 
	const { project: selectedProject } = useParams();
	const isSelected = (url: string) => url.endsWith(selectedProject);

	return (
		<MenuList anchorEl={anchorEl} onClose={handleClose} open={Boolean(anchorEl)} {...menuPosition}>
			{list.map(({ title, to, ...props }) => (
				<MenuItem
					key={title}
					to={to}
					{...props}
					onClick={handleClose}
					selected={isSelected(to)}
				>
					<Typography variant="body1" noWrap>
						{title}
					</Typography>
				</MenuItem>
			))}
		</MenuList>
	);
};
