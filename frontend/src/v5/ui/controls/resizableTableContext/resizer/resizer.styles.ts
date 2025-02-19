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

import styled from 'styled-components';
import { DraggingContainer } from '../draggingContainer/draggingContainer.component';
import { DelimiterLine } from '../delimiterLine/delimiterLine.component';

export const ResizerLine = styled(DelimiterLine)<{ $highlight: boolean, $isResizing?: boolean }>`
	border-color: ${({ $highlight, theme }) => $highlight ? theme.palette.primary.main : 'transparent'};
	border-style: ${({ $isResizing }) => $isResizing ? 'solid' : 'dashed'};
	position: absolute;
`;

export const ResizerElement = styled(DraggingContainer).attrs({ cursor: 'col-resize' })`
	height: 100%;
	position: relative;
	cursor: col-resize;
	width: 7px;
	left: -3px;
`;