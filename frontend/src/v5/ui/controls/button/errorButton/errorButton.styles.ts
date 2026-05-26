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
import { MuiButton } from '../button.styles';

const lightStyling = css`
	color: ${({ theme }) => theme.palette.error.main};
	border-color: ${({ theme }) => theme.palette.error.main};

	&.Mui-focusVisible {
		background-color: ${({ theme }) => theme.palette.error.main};
	}

	&:hover {
		color: ${({ theme }) => theme.palette.primary.contrastText};
		background-color: ${({ theme }) => theme.palette.error.main};
		border-color: ${({ theme }) => theme.palette.error.main};
	}

	&:active, &:focus {
		color: ${({ theme }) => theme.palette.primary.contrastText};
		border-color: ${({ theme }) => theme.palette.error.dark};
		background-color: ${({ theme }) => theme.palette.error.dark};
	}
`;

const darkStyling = css`
	color: ${({ theme }) => theme.palette.primary.contrast};
	border-color: ${({ theme }) => theme.palette.primary.contrast};

	&.Mui-focusVisible {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
	}

	&:hover {
		color: ${({ theme }) => theme.palette.error.main};
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		border-color: ${({ theme }) => theme.palette.primary.contrast};
	}

	&:active, &:focus {
		color: ${({ theme }) => theme.palette.error.dark};
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		border-color: ${({ theme }) => theme.palette.primary.contrast};
	}
`;

export const ErrorButton = styled(MuiButton).attrs({
	variant: 'outlined',
})<{ $dark?: boolean }>`
	${({ $dark }) => ($dark ? darkStyling : lightStyling)}
`;
