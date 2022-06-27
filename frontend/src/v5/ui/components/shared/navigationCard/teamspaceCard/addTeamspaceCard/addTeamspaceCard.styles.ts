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

import { Card } from '@mui/material';
import styled, { css } from 'styled-components';
import AddCircleIcon from '@assets/icons/add_circle_filled.svg';

export const Container = styled(Card)<{ $variant: string; }>`
	color: ${({ theme }) => theme.palette.primary.main};
	${({ theme }) => theme.typography.h3};
	border-style: dashed;
	border-width: 2px;
	background-color: transparent;
	width: 246px;
	height: 253px;
	display: flex;
	flex-flow: column;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	${({ $variant }) => {
		if ($variant === 'secondary') {
			return css`
				background-color: rgb(255 255 255 / 5%);
				border: none;
			`;
		}
		return '';
	}};
`;

export const AddTeamspaceIcon = styled(AddCircleIcon).attrs(({ theme }) => ({
	fillColour: theme.palette.primary.contrast,
}))`
	width: 37px;
	height: 37px;
`;
