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

import { MenuList, MenuItem, ArrowIcon } from './navigationMenu.styles';

export const NavigationMenu = (): JSX.Element => {
	const ITEM_LIST = [{
		title: 'Teamspace title',
		to: '/teamspace1',
	}, {
		title: 'Teamspace title',
		to: '/teamspace2',
	}, {
		title: 'Teamspace title',
		to: '/teamspace3',
	}, {
		title: 'Teamspace title',
		to: '/teamspace3',
	}, {
		title: 'Teamspace title',
		to: '/teamspace5',
		disabled: true,
	}];

	return (
		<MenuList>
			{ITEM_LIST.map(({ title, ...props }) => (
				<MenuItem {...props}>
					<Typography variant="body1" noWrap>
						{title}
					</Typography>
					<ArrowIcon>
						<path d="M0.509765 1.79236L3.21663 4.49922L0.509766 7.20609L1.40133 8.09766L4.99977 4.49922L1.40133 0.900791L0.509765 1.79236Z" />
					</ArrowIcon>
				</MenuItem>
			))}
		</MenuList>
	);
};
