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
import { ActionMenu as ActionMenuBase } from '@controls/actionMenu';
import { Menu } from '@controls/actionMenu/actionMenu.styles';
import MenuItemBase from '@mui/material/MenuItem';
import { Button } from '@controls/button';
import { Loader as UnstyledLoader } from '@/v4/routes/components/loader/loader.component';
import { TicketItemContainer } from './ticketItem/ticketItem.styles';

export const Loader = styled(UnstyledLoader)`
	height: 100%;
	background-color: ${({ theme }) =>  theme.palette.primary.contrast};
	width: calc(100% - 12px);
	border-radius: 10px;
	border: 0;
`;

export const ListContainer = styled.div`
	flex-grow: 1;
	margin-right: -12px;
	& > div {
		overflow-x: hidden;
	}
`;

export const List = styled.table`
	border: solid 1px ${({ theme }) => theme.palette.base.lightest};
	border-radius: 8px;
	overflow: hidden;
	width: 350px;
	margin-bottom: 0;
	background-color: ${({ theme }) =>  theme.palette.primary.contrast};
	box-sizing: border-box;
	tr:not(:last-child) ${/* sc-selector */ TicketItemContainer}{
		border-bottom: solid 1px ${({ theme }) => theme.palette.base.lightest};
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
