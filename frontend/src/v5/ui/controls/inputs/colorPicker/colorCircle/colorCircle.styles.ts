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

import { isLight } from '@/v5/helpers/colors.helper';
import styled, { css } from 'styled-components';

export const ColorCircle = styled.div<{ $size: number, $color?: string }>`
	height: ${({ $size }) => $size}px;
	width: ${({ $size }) => $size}px;
	border-radius: ${({ $size }) => $size}px;
	background-color: ${({ $color }) => $color};
	box-sizing: border-box;

	${({ $color, theme }) => isLight($color, 220) && css`
		border: solid 1px ${theme.palette.base.lightest};
	`}

	${({ $color, theme }) => !$color && css`
		background: linear-gradient(
			to top left,
			${theme.palette.primary.contrast} calc(50% - 0.5px),
			${theme.palette.error.main} 50%,
			${theme.palette.primary.contrast} calc(50% + 0.5px)
		);
	`}
`;
