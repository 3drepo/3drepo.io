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
import { MenuList as MenuListComponent, MenuItem as MenuItemComponent, SvgIcon } from '@material-ui/core';

export const ArrowIcon = styled(SvgIcon).attrs({
	viewBox: '0 0 5 9',
})`
	&& {
		height: 7px;
		width: 4.5px;
	}
`;
export const MenuList = styled(MenuListComponent)`
	&& {
		padding: 0;
		width: 226px;
	}
`;

export const MenuItem = styled(MenuItemComponent)`
	&& {
		margin: 0;
		height: 46px;
		padding-right: 14px;
		justify-content: space-between;

		${({ disabled }) => disabled && css`
			&& {
				pointer-events: none;
				color: ${({ theme }) => theme.palette.base.light};
			}
		`};

		&:not(:last-child) {
			border-bottom: 1px solid ${({ theme }) => theme.palette.base.lightest};
		}

		&:hover {
			color: ${({ theme }) => theme.palette.primary.main};
			background-color: initial;
		}

		&:focus {
			background-color: ${({ theme }) => theme.palette.primary.lightest};
		}

		&:active {
			color: ${({ theme }) => theme.palette.primary.contrast};
			background-color: ${({ theme }) => theme.palette.primary.dark};
		}
	}
`;
