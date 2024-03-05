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

import styled from 'styled-components';
import { FloatingBarItem as FloatingBarItemBase } from '../../toolbarButton/multioptionIcons.styles';

export const StrokeOption = styled.div<{ selected, $height }>`
	background-color: ${({ theme: { palette }, selected }) => selected ? palette.primary.main : palette.secondary.main};
	border-radius: ${({ $height }) => $height}px;
	border: none;
	outline: none;
	width: 30px;
	height: ${({ $height }) => $height}px;
`;

export const FloatingBarItem = styled(FloatingBarItemBase)`
	&:hover ${StrokeOption} {
		background-color: ${({ theme }) => theme.palette.primary.main};
	}
`;