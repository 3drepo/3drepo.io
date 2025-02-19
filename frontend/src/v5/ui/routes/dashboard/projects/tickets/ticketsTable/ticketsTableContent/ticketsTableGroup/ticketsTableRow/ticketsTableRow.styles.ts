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

import { DueDateContainer } from '@controls/dueDate/dueDate.styles';
import styled, { css } from 'styled-components';
import { ResizableTableRow } from '@controls/resizableTableContext/resizableTableRow/resizableTableRow.component';
import { TicketsTableCell } from './ticketsTableCell/ticketsTableCell.component';

export const Cell = styled(TicketsTableCell)``;

// TODO - fix when new palette is released
export const Row = styled(ResizableTableRow)<{ $selected?: boolean }>`
	gap: 1px;
	height: 37px;
	cursor: pointer;
	width: fit-content;

	${({ $selected }) => $selected && css`
		${Cell} {
			background-color: #edf0f8;
		}
	`}
`;

export const OverflowContainer = styled.div`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	display: inline-block;
`;

export const CellOwner = styled(Cell)`
	.MuiAvatar-root {
		width: 24px;
		height: 24px;
	}
`;

export const CellDate = styled(Cell)`
	${DueDateContainer} {
		height: unset;
	}
`;

export const SmallFont = styled.span`
	color: ${({ theme }) => theme.palette.base.main};
	font-size: 10px;
`;
