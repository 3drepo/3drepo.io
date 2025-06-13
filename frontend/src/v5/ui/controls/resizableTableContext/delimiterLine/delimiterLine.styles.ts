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

const LINE_WIDTH = 2;
export const DelimiterLine = styled.div<{ $offset: number, $style: 'dashed' | 'solid' | 'none' }>`
	position: relative;
	z-index: 10;
	width: ${LINE_WIDTH}px;
	height: 100%;
	margin-left: ${({ $offset }) => $offset - (LINE_WIDTH / 2)}px;
	pointer-events: all;

	${({ $style, theme }) => {
		if ($style === 'dashed') return css`
			background-repeat: repeat-y;
			background-image: linear-gradient(${theme.palette.primary.main} 50%, transparent 50%);
			background-size: 2px 7px;
		`;
		if ($style === 'solid') return css`
			background-color: ${theme.palette.primary.main};
		`;
	}}
`;
