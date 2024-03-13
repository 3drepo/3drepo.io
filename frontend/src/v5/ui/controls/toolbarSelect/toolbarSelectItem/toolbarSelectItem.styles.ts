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

export const IconContainer = styled.div<{ disabled?: boolean; selected?: boolean; }> `
	height: 40px;
	width: 40px;
	padding: 8px;
	box-sizing: border-box;
	cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
	display: grid;
	place-content: center;
	overflow: hidden;
	box-shadow: ${({ theme }) => theme.palette.shadows.level_5};
	margin-bottom: 5px;
	box-sizing: border-box;
	border-radius: 50%;

	background-color: ${({ theme }) => theme.palette.primary.contrast};
	border: solid 1px ${({ theme }) => theme.palette.secondary.lightest};

	${({ selected, theme }) => selected && css`
		color: ${theme.palette.primary.main};
	`}

	&:hover {
		color: ${({ theme }) => theme.palette.primary.main};
	}

	svg {
		width: 100%;
	}

	&[hidden] {
		height: 0;
		margin: 0;
	}
`;

export const RefContainer = styled.div`
	display: grid;
	place-items: center;
`;
