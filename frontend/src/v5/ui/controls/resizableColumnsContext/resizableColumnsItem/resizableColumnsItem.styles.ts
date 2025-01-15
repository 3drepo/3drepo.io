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

export const Container = styled.div<{ $width }>`
	display: inline-flex;
	flex-direction: row;
	min-width: ${({ $width }) => $width}px;
	max-width: ${({ $width }) => $width}px;
`;

export const Item = styled.div`
	width: 100%;
	overflow: hidden;
`;

export const ResizerContainer = styled.div<{ $isResizing: boolean, $highlight: boolean }>`
	height: 100%;
	z-index: 1;
	position: relative;

	${({ $highlight, $isResizing, theme }) => $highlight && css`
		border-color: ${theme.palette.primary.main};
		border-width: 1px;
		border-style: ${$isResizing ? 'solid' : 'dashed'};
	`}
`;

export const Resizer = styled.div`
	height: 100%;
	position: absolute;
	cursor: col-resize;
	width: 6.5px;
	left: -3px;
`;