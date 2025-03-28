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
import { Button } from '@mui/material';

export const BaseCircleButton = styled(Button)<{ disabled?: boolean }>`
	height: 38px;
	min-width: 38px;
	width: 38px;
	border-radius: 100%;
	border: none;
	margin: 8px 7px;
	background-color: transparent;
	padding: 0;
	display: flex;
	place-items: center;

	& > svg {
		height: 17px;
		width: auto;
	}
`;

export const PrimaryButton = styled(BaseCircleButton)`
	color: ${({ theme }) => theme.palette.secondary.main};

	&:hover, &.Mui-focusVisible {
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	}
`;

export const SecondaryButton = styled(BaseCircleButton)`
	color: ${({ theme }) => theme.palette.primary.contrast};

	&:hover, &.Mui-focusVisible { 
		background-color: ${({ theme }) => theme.palette.secondary.light};
	}
`;

export const ViewerButton = styled(BaseCircleButton)<{ selected?: boolean }>`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	color: ${({ theme }) => theme.palette.secondary.main};
	margin: 0;
	height: 32px;
	width: 32px;
	min-width: 32px;
	&:hover {
		background-color: ${({ theme }) => theme.palette.tertiary.lighter};
	}
	${({ selected }) => selected && css`
		&, &:hover {
			background-color: ${({ theme }) => theme.palette.secondary.main};
			color: ${({ theme }) => theme.palette.secondary.contrastText};
		}
	`}
`;
