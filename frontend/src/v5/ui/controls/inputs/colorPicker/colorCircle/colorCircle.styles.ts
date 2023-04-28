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

import styled, { css } from 'styled-components';
import { contrastColor } from 'contrast-color';

export const isLight = (bgColor) => contrastColor({ bgColor, threshold: 220 }) !== '#FFFFFF';

export const ColorCircle = styled.div<{ $size: number, $color?: string }>`
	cursor: pointer;
	height: ${({ $size }) => $size}px;
	width: ${({ $size }) => $size}px;
	border-radius: ${({ $size }) => $size}px;
	background-color: ${({ $color }) => $color};
	box-sizing: border-box;

	${({ $color, theme }) => isLight($color) && css`
		border: solid 1px ${theme.palette.base.lightest};
	`}

	${({ $color, $size, theme }) => !$color && css`
		transform: rotate(135deg);
		background-color: transparent;

		&::after {
			content: '';
			width: 100%;
			height: 1px;
			display: flex;
			margin-top: ${$size / 2 - 1.5}px;
			background-color: ${theme.palette.error.main};
		}
	`}
`;
