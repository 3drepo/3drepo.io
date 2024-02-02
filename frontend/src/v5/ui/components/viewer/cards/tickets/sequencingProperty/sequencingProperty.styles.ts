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

export const Container = styled.div`
	position: relative;
`;

export const IconContainer = styled.div`
	color: ${({ theme }) => theme.palette.secondary.main};
	margin-top: -7px;
	cursor: pointer;

	svg {
		width: 10px;
		height: 10px;
	}
`;

export const SequenceIconContainer = styled(IconContainer)<{ disabled?: boolean }>`
	position: absolute;
	right: 28px;
	bottom: 2px;
	padding: 5px;
	display: flex;

	svg {
		width: 12.5px;
		height: 12.5px;
	}

	${({ disabled, theme }) => disabled && css`
		cursor: unset;
		color: ${theme.palette.base.light};
	`}
`;
