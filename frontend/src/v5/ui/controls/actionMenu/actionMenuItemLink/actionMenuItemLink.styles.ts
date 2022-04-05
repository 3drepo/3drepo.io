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
import ListItemIcon from '@mui/material/ListItemIcon';
import { Link as LinkBase } from 'react-router-dom';

export const Link = styled(LinkBase)`
	text-decoration: none;
	width: 100%;
	box-sizing: border-box;
	cursor: pointer;
	transition: all 0s;
	border-radius: 3px;
	height: 39px;
	padding: 0 11px;
	display: flex;
	flex-direction: row;
	align-items: center;
	text-align: left;

	&:hover {
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	}

	&:focus {
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	}

	&:active {
		background-color: ${({ theme }) => theme.palette.base.light};
	}
`;

export const ItemIcon = styled(ListItemIcon)`
	&& {
		margin-right: 10px;
		min-width: 0;
		color: ${({ theme }) => theme.palette.base.main};
	}
`;

export const ItemText = styled.div`
	&& {
		color: ${({ theme }) => theme.palette.secondary.main};
		${({ theme }) => theme.typography.body1};
		font-size: 12px;
		text-decoration: none;
		margin: 0;
	}
`;
