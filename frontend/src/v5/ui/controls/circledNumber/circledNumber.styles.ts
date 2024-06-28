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

export const CircledNumber = styled.span<{ disabled?: boolean }>`
	width: 24px;
	height: 24px;
	background-color: ${({ theme }) => theme.palette.tertiary.lighter};
	color: ${({ theme }) => theme.palette.secondary.main};
	display: inline-flex;
	justify-content: center;
	align-items: center;
	border-radius: 12px;
	font-size: 11px;
	box-sizing: border-box;
	margin-left: 5px;

	${({ disabled, theme }) => disabled && css`
		background-color: transparent;
		border: currentColor 1px solid;
		color: ${theme.palette.base.lightest};
	`}
`;
