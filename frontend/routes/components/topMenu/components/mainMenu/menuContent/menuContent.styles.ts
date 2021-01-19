/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import styled from 'styled-components';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { COLOR } from '../../../../../../styles';

export const MenuIcon = styled(ListItemIcon)`
	&& {
		margin-right: 2px;
	}
`;

export const MenuItem = styled(ListItem)`
	&& {
		height: 48px;
	}
`;

export const MenuUser = styled(ListItem)`
	&& {
		height: 58px;
	}
`;

export const MenuText = styled(ListItemText).attrs({
	disableTypography: true
})`
	&& {
		color: ${COLOR.BLACK_60};
		font-size: 14px;
		padding-left: ${({ submenu }) => submenu ? 0 : 'inherit'};
	}
`;
