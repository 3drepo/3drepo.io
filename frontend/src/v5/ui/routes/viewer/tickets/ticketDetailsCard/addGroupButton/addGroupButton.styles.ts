/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { Button } from '@controls/button';
import { Select } from '@controls/inputs/select/select.component';
import { Popover } from '@mui/material';
import styled from 'styled-components';
import { Buttons } from '../../ticketsForm/ticketGroups/groups/groupActionMenu/groupSettingsForm/groupSettingsForm.styles';

export const AddGroupButtonBase = styled(Button).attrs({
	variant: 'outlined',
	color: 'secondary',
})`
	height: 30px;
	margin: 0;
`;

export const AddGroupPopover = styled(Popover)`
	.MuiPaper-root {
		width: 380px;
		padding: 10px 16px 16px;
		box-sizing: border-box;
	}
`;

export const GroupFunctionSelect = styled(Select)`
	width: 100%;

	.MuiInputLabel-root {
		color: ${({ theme }) => theme.palette.base.main};
	}

	.MuiInputBase-root {
		background: ${({ theme }) => theme.palette.primary.contrast};
		border-radius: 8px;
	}
`;

export const AddGroupActions = styled(Buttons)`
	gap: 15px;
`;
