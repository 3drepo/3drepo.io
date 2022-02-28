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

import styled from 'styled-components';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Link as LinkBase } from 'react-router-dom';

export const Link = styled(LinkBase)`
	text-decoration: none;
`;

export const MenuItemContainer = styled.div`
	display: flex;
`;

export const ItemIcon = styled(ListItemIcon)`
	&& {    
		margin-right: 10px;
		min-width: 0;
	}
`;

export const ItemText = styled(ListItemText).attrs({
	disableTypography: true,
})`
	&& {
		color: ${({ theme }) => theme.palette.secondary.main};
		${({ theme }) => theme.typography.body1};
		font-size: 12px;
		text-decoration: none;
		margin: 0;
	}
`;

export const MenuItem = styled(ListItem)`
	&& {
		transition: all 0s;
		border-radius: 3px;
		margin: 0;
		padding: 0;

		& > * {
			width: 100%;
			padding: 0 11px;
		}
	}

`;
