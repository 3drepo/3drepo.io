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
import { Container as FixedOrGrowContainer } from '@controls/fixedOrGrowContainer/fixedOrGrowContainer.styles';

export const Cell = styled(FixedOrGrowContainer)<{ hidden?: boolean }>`
	color: ${({ theme }) => theme.palette.secondary.main};
	height: 100%;
	padding: 0 10px;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	font-weight: 500;
	overflow: hidden;
	box-sizing: border-box;

	${({ width }) => width ? css`
		flex: 0 0 ${width};
	` : css`
		flex: 1;
		min-width: 300px;
	`}

	${({ hidden }) => hidden && css`
		display: none;
	`}
`;

// TODO - fix when new palette is released
export const Row = styled.div<{ $selected?: boolean }>`
	display: flex;
	gap: 1px;
	height: 37px;
	cursor: pointer;
	width: min(90vw, 1289px);

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

export const CellChipText = styled(Cell)`
	>.MuiChip-root {
		padding-left: 0;
	}
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
