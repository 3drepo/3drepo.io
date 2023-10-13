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

import styled, { css } from 'styled-components';
import { DateTimePicker as DateTimePickerBase } from '@controls/inputs/datePicker/dateTimePicker.component';

export const DateTimePicker = styled(DateTimePickerBase)`
	/* .MuiIconButton-root {
		cursor: unset;
	} */
`;

export const Icons = styled.div`
	display: flex;
	flex-direction: row;
	place-content: center;
	height: 100%;
	gap: 8px;
	z-index: 1;
	cursor: initial;

	svg {
		width: 14px;
		height: 14px;
	}
`;

export const IconContainer = styled.div`
	color: ${({ theme }) => theme.palette.secondary.main};
	margin-top: -2px;
	cursor: pointer;
`;
