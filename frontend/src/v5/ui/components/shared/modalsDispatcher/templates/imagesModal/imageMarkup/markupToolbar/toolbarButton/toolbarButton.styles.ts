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

import styled, { css } from 'styled-components';

export const Container = styled.div<{ disabled?: boolean, selected?: boolean }>`
	height: 40px;
	width: 40px;
	padding: 0 10px;
	box-sizing: border-box;
	cursor: pointer;
	display: grid;
	place-content: center;
	overflow: hidden;
	color: ${({ theme }) => theme.palette.secondary.main};

	${({ selected, theme }) => selected && css`
		color: ${theme.palette.primary.main};
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

