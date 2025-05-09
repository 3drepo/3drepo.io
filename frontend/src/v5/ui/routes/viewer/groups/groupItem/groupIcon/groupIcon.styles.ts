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
import Checkers from '@assets/images/checkers.svg';
import { ComponentToString } from '@/v5/helpers/react.helper';

export const Container = styled.div`
	display: grid;
	box-sizing: border-box;
	min-width: 30px;
	height: 28px;
	
	& > * {
		grid-column-start: 1;
		grid-row-start: 1;
		border-radius: 5px;
	}
`;

export const Background = styled.div`
	background-image: url('data:image/svg+xml;utf8,${ComponentToString(Checkers)}');
`;

export const GroupIcon = styled.div<{ $color?: string, $variant?: 'light' | 'dark' }>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	background-color: ${({ $color }) => $color};
	
	${({ $variant, theme }) => ($variant === 'light' ? css`
		color: ${theme.palette.base.main};
		border: 1px solid ${theme.palette.base.mid};
	` : css`
		color: ${theme.palette.primary.contrast};
	`)};
`;
