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
import styled from 'styled-components';
import AddCircleIcon from '@assets/icons/add_circle.svg';

export const Container = styled(Card)<{ $variant: string; }>`
	border-color: ${({ $variant, theme }) => {
		if ($variant === 'primary') return theme.palette.tertiary.lightest;
		if ($variant === 'secondary') return theme.palette.secondary.mid;
		return '';
	}};
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
`;

export const AddTeamspaceIcon = styled(AddCircleIcon)`
	width: 31px;
	height: 31px;
`;
