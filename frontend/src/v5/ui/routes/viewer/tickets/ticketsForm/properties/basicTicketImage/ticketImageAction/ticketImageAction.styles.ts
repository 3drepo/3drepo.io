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
import { ActionMenu as ActionMenuBase } from '@controls/actionMenu';
import { Menu } from '@controls/actionMenu/actionMenu.styles';
import MenuItemBase from '@mui/material/MenuItem';

export const TicketImageAction = styled.li<{ disabled?: boolean }>`
	line-height: 20px;
	font-weight: 500;
	font-size: 10px;
	color: ${({ theme }) => theme.palette.base.main};
	display: flex;
	align-items: center;

	& svg {
		margin-right: 4px;
		width: 12px;
	}
	
	&:hover {
		cursor: pointer;
		color: ${({ theme }) => theme.palette.secondary.main};
	}

	${({ disabled, theme }) => disabled && css`
		&, &:hover {
			cursor: default;
			pointer-events: none;
			color: ${theme.palette.secondary.lightest};
		}
	`}
`;

export const ActionMenu = styled(ActionMenuBase).attrs({
	PopoverProps: {
		anchorOrigin: {
			vertical: 'bottom',
			horizontal: 'left',
		},
		transformOrigin: {
			vertical: 'top',
			horizontal: 'left',
		},
	},
})`
	${Menu} {
		padding: 4px 0;
	}
`;

export const MenuItem = styled(MenuItemBase)`
	padding: 5px 12px;
`;

export const MenuItemDelete = styled(MenuItem)`
	color: ${({ theme }) => theme.palette.error.main};
`;
