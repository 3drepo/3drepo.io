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

import styled, { css } from 'styled-components';

// This is not to interfere with other components and to keep the cursor as
// "col-resize" while resizing even when moving the mouse outside the table
export const overlayStyles = `
	height: 100vh;
	width: 100vw;
	cursor: col-resize;
	pointer-events: all;
	position: absolute;
	z-index: 100;
	top: 0;
`;

export const ResizerElement = styled.div`
	height: 100%;
	position: relative;
	cursor: col-resize;
	width: 7px;
	left: -3.5px;
`;

const LINE_WIDTH = 2;
export const ResizerLine = styled.div<{ $offset: number, $isResizing: boolean, $highlight: boolean }>`
	position: relative;
	z-index: 10;
	width: ${LINE_WIDTH}px;
	height: 100%;
	margin-left: ${({ $offset }) => $offset - (LINE_WIDTH / 2)}px;
	pointer-events: all;

	${({ $highlight, theme }) => $highlight && css`
		background-repeat: repeat-y;
		background-image: linear-gradient(${theme.palette.primary.main} 50%, transparent 50%);
		background-size: 2px 7px;
	`}

	${({ $isResizing, theme }) => $isResizing && css`
		background-color: ${theme.palette.primary.main};
	`}
`;