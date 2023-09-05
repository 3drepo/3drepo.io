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

import MuiButtonBase from '@mui/material/Button';
import styled from 'styled-components';

export const MuiButton = styled(MuiButtonBase)`
	white-space: nowrap;
`;

export const ErrorButton = styled(MuiButton).attrs({
	variant: 'outlined',
})`
	height: 35px;
	color: ${({ theme }) => theme.palette.error.main};
	border-color: ${({ theme }) => theme.palette.error.main};

	&.Mui-focusVisible {
		background-color: ${({ theme }) => theme.palette.error.main};
	}

	&:hover {
		color: ${({ theme }) => theme.palette.error.contrastText};
		background-color: ${({ theme }) => theme.palette.error.main};
		border-color: ${({ theme }) => theme.palette.error.main};
		text-decoration-line: none;
	}

	&:active {
		color: ${({ theme }) => theme.palette.error.contrastText};
		border-color: ${({ theme }) => theme.palette.error.dark};
		background-color: ${({ theme }) => theme.palette.error.dark};
	}
`;

export const SuccessButton = styled(MuiButton).attrs({
	variant: 'outlined',
})`
	height: 35px;
	color: ${({ theme }) => theme.palette.success.main};
	border-color: ${({ theme }) => theme.palette.success.main};

	&.Mui-focusVisible {
		background-color: ${({ theme }) => theme.palette.success.main};
	}

	&:hover {
		color: ${({ theme }) => theme.palette.success.contrastText};
		background-color: ${({ theme }) => theme.palette.success.main};
		border-color: ${({ theme }) => theme.palette.success.main};
		text-decoration-line: none;
	}

	&:active {
		color: ${({ theme }) => theme.palette.success.contrastText};
		border-color: ${({ theme }) => theme.palette.success.dark};
		background-color: ${({ theme }) => theme.palette.success.dark};
	}
`;
