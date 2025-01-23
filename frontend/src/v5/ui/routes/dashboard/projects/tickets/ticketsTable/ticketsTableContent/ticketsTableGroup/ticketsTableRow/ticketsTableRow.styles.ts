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
import styled from 'styled-components';
import { ResizableTableRow } from '@controls/resizableTableContext/resizableTableRow/resizableTableRow.component';
import { ResizableTableCell } from '@controls/resizableTableContext/resizableTableCell/resizableTableCell.component';

export const Cell = styled(ResizableTableCell)`
	color: ${({ theme }) => theme.palette.secondary.main};
	height: 100%;
	padding: 0 10px;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	font-weight: 500;
	overflow: hidden;
	box-sizing: border-box;
`;

// TODO - fix when new palette is released
export const Row = styled(ResizableTableRow)<{ $selected?: boolean }>`
	gap: 1px;
	height: 37px;
	cursor: pointer;
	width: fit-content;

	${Cell} {
		background: ${({ $selected, theme }) => ($selected ? '#edf0f8' : theme.palette.primary.contrast)};
	}
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
		height: 18px;
	}
`;

export const SmallFont = styled.span`
	color: ${({ theme }) => theme.palette.base.main};
	font-size: 10px;
`;
