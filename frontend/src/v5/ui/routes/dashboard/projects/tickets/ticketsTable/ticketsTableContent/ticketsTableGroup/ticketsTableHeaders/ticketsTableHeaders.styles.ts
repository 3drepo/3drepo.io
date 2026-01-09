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
import styled from 'styled-components';
import { TextOverflow } from '@controls/textOverflow';
import { ResizableTableHeader } from '@controls/resizableTableContext/resizableTableHeader/resizableTableHeader.component';

export const Headers = styled(ResizableTableRow)`
	gap: 1px;
	margin-bottom: 6px;
	width: 100%;
	height: 26px;
`;

export const PlaceholderForStickyFunctionality = styled(Headers)``;

export const HeaderCellText = styled(TextOverflow)`
	text-align: start;
	box-sizing: border-box;
	height: auto;
	cursor: pointer;
`;

export const HeaderCell = styled(ResizableTableHeader)`
	align-self: center;
	padding: 5px 2px 0;
	margin: 0px;
	${({ theme }) => theme.typography.kicker};
	color: ${({ theme }) => theme.palette.base.main};
	user-select: none;
	align-items: center;

	svg {
		width: 16px;
		align-self: center;
	}

`;

export const BulkEditHeaderButton = styled.div`
	display: flex;
	border: 1px solid ${({ theme }) => theme.palette.base.main};
	border-radius: 5px;
	padding: 4px 5px;
	width: 100%;
	
	&:active, &:hover {
		background-color: ${({ theme }) => theme.palette.base.main};
		color: ${({ theme }) => theme.palette.primary.contrast};
	}
`;
