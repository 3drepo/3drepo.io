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

import styled, { css } from 'styled-components';
import { Link as LinkComponent } from '@mui/material';
import { NavLink } from 'react-router-dom';

export const Container = styled.nav`
	display: flex;
	padding-left: 79px;
	box-shadow: 0 0 13px -7px;
	position: relative;
	z-index: 15;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
`;

export const Link: typeof NavLink = styled(LinkComponent).attrs({
	component: NavLink,
	activeClassName: 'active',
})<{ disabled?: boolean }>`
	&& {
		text-decoration: none;
		display: flex;
		align-items: center;
		position: relative;
		margin-left: 13px;
		margin-right: 13px;
		height: 50px;
		color: ${({ theme }) => theme.palette.base.main};
		font-family: ${({ theme }) => theme.typography.fontFamily};
		font-weight: 500;
		font-size: 13px;
		text-transform: none;

		&:first-child {
			margin-left: 0;
		}

		&:hover {
			text-decoration: none;
			color: ${({ theme }) => theme.palette.primary.main};
		}

		&.Mui-focusVisible {
			outline: none;
			text-decoration: underline;
		}
	}

	${({ disabled }) => disabled && css`
		&& {
			color: ${({ theme }) => theme.palette.base.light};
			pointer-events: none;
		}
	`};

	&.active {
		color: ${({ theme }) => theme.palette.primary.main};

		&::after {
			content: '';
			background-color: currentColor;
			display: block;
			height: 3px;
			width: 100%;
			position: absolute;
			bottom: 0;
			left: 0;
		}
	}
`;
