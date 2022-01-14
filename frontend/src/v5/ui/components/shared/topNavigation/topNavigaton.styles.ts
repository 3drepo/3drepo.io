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

import styled, { css } from 'styled-components';
import { Link as LinkComponent } from '@material-ui/core';
import { NavLink } from 'react-router-dom';

export const Container = styled.nav`
	display: flex;
	margin-right: 20px;
`;

export const Link = styled(LinkComponent).attrs({
	component: NavLink,
	activeClassName: 'active',
})`
	&& {
		text-decoration: none;
		display: flex;
		align-items: center;
		position: relative;
		margin-left: 13px;
		margin-right: 13px;
		padding-top: 4px;
		height: 56px;
		color: ${({ theme }) => theme.palette.base.main};
		font-family: ${({ theme }) => theme.typography.fontFamily};
		${({ theme }) => theme.typography.kickerTitle};
		
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
		&::after {
			content: '';
			background-color: ${({ theme }) => theme.palette.primary.main};
			display: block;
			height: 4px;
			width: 100%;
			position: absolute;
			bottom: 4px;
			left: 0;
		}
	}
`;
