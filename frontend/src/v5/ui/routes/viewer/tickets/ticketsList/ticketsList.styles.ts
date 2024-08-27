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
import { Button } from '@controls/button';
import { FilterChip } from '@controls/chip/filterChip/filterChip.styles';
import { TicketItemContainer } from './ticketItem/ticketItem.styles';

export const List = styled.div`
	border: solid 1px ${({ theme }) => theme.palette.base.lightest};
	border-radius: 8px;
	overflow: hidden;
	display: inline-block;
	width: 100%;
	margin-bottom: 0;
	${/* sc-selector */ TicketItemContainer}:not(:last-child) {
		border-bottom: solid 1px ${({ theme }) => theme.palette.base.lightest};
	}
`;

export const Filters = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 10px;
	margin-bottom: 13px;
`;

export const CompletedFilterChip = styled(FilterChip).attrs(({ selected, theme }: any) => ({
	color: theme.palette.success.main,
	variant: selected ? 'filled' : 'outlined',
}))<{ selected: boolean }>`
	.MuiChip-root, .MuiChip-root:hover {
		color: ${({ theme }) => theme.palette.success.main};
		border: 1px solid ${({ theme }) => theme.palette.success.main};
		${({ selected, theme: { palette } }) => selected && css`
			color: ${palette.primary.contrast};
			background-color: ${palette.success.main};
		`}
	}
`;

export const NewTicketButton = styled(Button).attrs({
	variant: 'contained',
})`
	margin: 0 0 0 auto;
	padding: 7px 9px;
	height: 30px;
	svg {
		margin-right: 6px;
	}
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

export const Actions = styled.div` // Can be removed when #5009 merged in
	display: contents;
`;
