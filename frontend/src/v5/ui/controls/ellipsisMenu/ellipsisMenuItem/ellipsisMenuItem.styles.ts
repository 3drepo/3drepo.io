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
import { MenuItem as MenuItemComponent } from '@mui/material';
import { Link } from 'react-router-dom';

export const MenuItem = styled(MenuItemComponent)<typeof Link>`
	${({ theme }) => theme.typography.body1};
	color: ${({ theme }) => theme.palette.secondary.main};
	margin: 0;
	height: 40px;
	padding-right: 14px;
	justify-content: space-between;

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

export const SwitchContainer = styled.span`
	width: 100%;
	height: 32px;
	align-content: center;
	text-align: left;
	display: grid;
	grid-template-columns: 26px auto 16px;
	svg {
		height: 16px;
		width: 16px;
	}
`;
