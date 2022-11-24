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
import { Fab } from '@mui/material';

const baseFabButtonStyle = css<{ disabled?: boolean }>`
	height: 38px;
	width: 38px;
	flex-shrink: 0;

	${({ disabled }) => disabled && css`
		path {
			fill: ${({ theme }) => theme.palette.secondary.light};
		}
	`};
`;

export const MainFabButton = styled(Fab)`
	${baseFabButtonStyle}
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	border: none;

	&:hover, &.Mui-focusVisible {
		background-color: transparent;
	}
`;

export const ContrastFabButton = styled(Fab)`
	${baseFabButtonStyle}
	${({ disabled }) => disabled && css`
		border-color: ${({ theme }) => theme.palette.secondary.light};
		pointer-events: none;
	`};

	&:hover {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		path {
			fill: ${({ theme }) => theme.palette.secondary.main};
		}
	}

	&.Mui-focusVisible {
		border: 1px solid ${({ theme }) => theme.palette.primary.main};
		path {
			fill: ${({ theme }) => theme.palette.primary.main};
		}
	}
`;
