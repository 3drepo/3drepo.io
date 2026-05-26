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

import { ListItemButton } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import styled, { css } from 'styled-components';

export const Item = styled(ListItemButton)`
	&& {
		padding: 6px;
	}
`;

export const Container = styled(Paper)`
	background-color: transparent;
	margin: 3px;
	${({ $read }: any) => !$read && css`
		.MuiButtonBase-root:hover .MuiListItemText-root > span {
			text-decoration: underline;
		}
	`}
`;

export const ItemText = styled(ListItemText)`
	&& {
		padding: 0;
		margin-left: 9px;
	}

	${/* sc-selector */ Item}:hover & {
		width: 0;
	}
`;

export const ItemSecondaryAction = styled.div`
	visibility: hidden;
	width: 0;
	height: 40px;
	overflow: hidden;
	display: flex;
	align-items: center;
	
	& .MuiIconButton-root {
		padding: 17px;
	}

	${/* sc-selector */ Item}:hover & {
		visibility: inherit;
		width:75px;
	}
`;
