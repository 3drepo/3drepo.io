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

export const ValuesContainer = styled.div`
	display: flex;
	flex-direction: row;
	align-items: end;
	gap: 10px;
`;

export const ValueIconContainer = styled.button.attrs({
	type: 'button',
})<{ disabled?: boolean }>`
	cursor: pointer;
	color: ${({ theme }) => theme.palette.secondary.main};
	${({ theme, disabled }) => disabled && css`
		cursor: auto;
		color: ${theme.palette.base.light};
	`}
	display: inline-block;
	padding: 0;
	height: 18px;
	margin-bottom: 15px;
	border: none;
	background: transparent;
`;
