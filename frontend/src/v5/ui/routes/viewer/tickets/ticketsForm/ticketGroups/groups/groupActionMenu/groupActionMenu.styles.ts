/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { ActionMenu } from '@controls/actionMenu';
import { Menu } from '@controls/actionMenu/actionMenu.styles';
import styled from 'styled-components';

export const TicketsGroupActionMenu = styled(ActionMenu).attrs({
	PopoverProps: {
		anchorOrigin: {
			vertical: 'top',
			horizontal: 'right',
		},
		transformOrigin: {
			vertical: 'top',
			horizontal: 'left',
		},
	},
})`
	${Menu} {
		padding: 14px;
		display: flex;
		flex-direction: column;
		width: 362px;
		border-radius: 10px;
	}
	.MuiPaper-root {
		margin-left: 15px;
		box-shadow: ${({ theme }) => theme.palette.shadows.level_5};
	}
`;
