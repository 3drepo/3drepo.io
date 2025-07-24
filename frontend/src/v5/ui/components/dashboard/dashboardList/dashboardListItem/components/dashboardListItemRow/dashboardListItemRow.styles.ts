/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { alpha } from '@mui/material/styles';
import { LabelButton } from '@controls/button';

export const Container = styled.div<{ selected?: boolean }>`
	position: relative;
	display: flex;
	align-items: center;
	height: 80px;
	padding: 0 29px;
	cursor: pointer;
	background-color: ${({ theme }) => theme.palette.primary.contrast};

	${({ theme, selected }) => selected && css`
		background-color: ${theme.palette.secondary.main};

		&::before {
			background-color: ${theme.palette.secondary.main};
			border: none;
		}

		${LabelButton} {
			background-color: ${alpha(theme.palette.tertiary.lightest, 0.8)};
			color: ${theme.palette.tertiary.main};
		}
	`}
`;
