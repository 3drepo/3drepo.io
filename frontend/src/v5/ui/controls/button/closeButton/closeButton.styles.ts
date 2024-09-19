/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { BaseCircleButton } from '@controls/circleButton/circleButton.styles';
import styled from 'styled-components';
import { hexToOpacity } from '@/v5/helpers/colors.helper';

export const Button = styled(BaseCircleButton)<{ $variant?: 'primary' | 'secondary' }>`
	color:  ${({ theme: { palette }, $variant }) => $variant === 'secondary' ?  palette.base.main : palette.primary.contrast};
	background-color: ${({ theme: { palette }, $variant }) => $variant === 'secondary' ? palette.primary.contrast : hexToOpacity(palette.primary.contrast, 3.9)};
	align-self: flex-end;
	margin-left: auto;
	box-shadow: ${({ theme }) => theme.palette.shadows.level_3};
	position: absolute;
	right: 0;
	z-index: 1;

	&:hover, &.Mui-focusVisible {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		color: ${({ theme }) => theme.palette.secondary.main};
		box-shadow: ${({ theme }) => theme.palette.shadows.level_3};
	}
`;
