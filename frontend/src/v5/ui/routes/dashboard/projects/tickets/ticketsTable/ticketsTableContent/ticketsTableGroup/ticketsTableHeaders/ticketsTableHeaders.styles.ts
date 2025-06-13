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

import { ResizableTableRow } from '@controls/resizableTableContext/resizableTableRow/resizableTableRow.component';
import styled, { css } from 'styled-components';
import { TextOverflow } from '@controls/textOverflow';

export const Headers = styled(ResizableTableRow)`
	gap: 1px;
	width: fit-content;
`;

export const PlaceholderForStickyFunctionality = styled(Headers)``;

export const Header = styled(TextOverflow)<{ $selectable?: boolean }>`
	${({ theme }) => theme.typography.kicker};
	color: ${({ theme }) => theme.palette.base.main};
	padding: 2px 0 8px 10px;
	text-align: start;
	box-sizing: border-box;
	user-select: none;

	${({ $selectable }) => $selectable && css`
		cursor: pointer;
	`}
`;