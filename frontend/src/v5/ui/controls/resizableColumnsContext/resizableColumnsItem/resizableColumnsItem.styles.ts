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

export const ResizerMouseLandingArea = styled.div`
	height: 100%;
	position: relative;
	cursor: col-resize;
	width: 7px;
	left: -3px;
`;

export const ResizerLine = styled.div<{ $isResizing: boolean, $highlight: boolean }>`
	height: 100%;
	z-index: 1;
	position: relative;
	width: 0;
	margin-left: .5px;
	border: dashed 1px transparent;

	${({ $highlight, theme }) => $highlight && css`
		border-color: ${theme.palette.primary.main};
	`}

	${({ $isResizing }) => $isResizing && css`
		border-style: solid;
	`}
`;