/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { Checkbox as CheckboxBase } from '@mui/material';
import styled from 'styled-components';
import { HeaderCell } from '../ticketsTableHeaders/ticketsTableHeaders.styles';
import { Group } from '../ticketsTableGroup.styles';
import { Row } from '../ticketsTableRow/ticketsTableRow.styles';
import { SELECTION_COLUMN_WIDTH } from '../ticketsTableGroup.helper';

export const Checkbox = styled(CheckboxBase)<{ disabled?: boolean }>`
	margin: 0 auto;
	padding: 0;
	${({ disabled }) => disabled && `
		opacity: 0.4;
	`}
`;

export const CheckboxHeaderCell = styled(HeaderCell).attrs({
	draggable: false,
})`
	height: 27px;
	overflow: visible;
`;

export const SelectionColumnContainer = styled(Group)`
	width: ${SELECTION_COLUMN_WIDTH}px;
	gap: 0;
	& div > ${/* sc-selector */Row} {
		width: ${SELECTION_COLUMN_WIDTH}px;
	}
`;
