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

import { hexToOpacity } from '@/v5/helpers/colors.helper';
import styled, { css } from 'styled-components';

export const Container = styled.div<{ disabled?: boolean, selected?: boolean, $expanded?: boolean }>`
	height: 40px;
	width: 40px;
	padding: 0 10px;
	box-sizing: border-box;
	cursor: pointer;
	display: grid;
	place-content: center;
	color: ${({ theme }) => theme.palette.secondary.main};
	border-radius: 50%;

	${({ $expanded, selected, theme }) => ($expanded || selected) && css`
		color: ${theme.palette.primary.main};
	`}

	${({ selected, theme }) => selected && css`
		background-color: ${hexToOpacity(theme.palette.primary.light, 25)};
	`}

	${({ disabled, theme }) => disabled ? css`
		cursor: default;
		color: ${theme.palette.base.light};
	` : css`
		&:hover {
			color: ${theme.palette.primary.main};
		}
	`}

	svg {
		width: 100%;
	}
`;

