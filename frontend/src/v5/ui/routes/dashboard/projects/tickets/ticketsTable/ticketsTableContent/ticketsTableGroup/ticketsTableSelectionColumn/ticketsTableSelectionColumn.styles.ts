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
import { SELECTION_COLUMN_WIDTH } from './ticketsTableSelectionColumn.helper';

export const Checkbox = styled(CheckboxBase)`
	margin: 0 auto;
	padding: 0;
`;

export const CheckboxHeaderCell = styled(HeaderCell).attrs({
	draggable: false,
})`
	height: 16px;
	overflow: visible;
	&:last-of-type {
		padding: inherit;
	}
`;

export const SelectionColumnContainer = styled(Group)`
	width: ${SELECTION_COLUMN_WIDTH}px;
	gap: 0;
	& div > ${/* sc-selector */Row} {
		width: ${SELECTION_COLUMN_WIDTH}px;
		border-right: 1px solid ${({ theme }) => theme.palette.tertiary.lightest};

		&:first-child{
			border-radius: 10px 0 0;
			overflow: hidden;
		}
		&:last-child{
			border-bottom: 1px solid ${({ theme }) => theme.palette.tertiary.lightest};
		}
	}
`;
