/**
 *  Copyright (C) 2022 3D Repo Ltd
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

export const DateContainer = styled.span<{ isOverdue?: boolean; disabled?: boolean }>`
	font-size: 10px;
	padding: 3px 0;
	color: ${({ theme, isOverdue = false }) => (isOverdue ? theme.palette.error.main : theme.palette.secondary.main)};
	${({ disabled }) => !disabled && css`
		&:hover {
			text-decoration: underline;
		}
	`}
`;

export const EmptyDateContainer = styled(DateContainer)`
	color: ${({ theme }) => theme.palette.base.main};
`;
