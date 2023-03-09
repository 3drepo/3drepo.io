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

import { css } from 'styled-components';

export const primaryButtonStyling = css`
	color: ${({ theme }) => theme.palette.primary.contrast};
	background-color: ${({ theme }) => theme.palette.primary.main};

	&.Mui-focusVisible {
		background-color: ${({ theme }) => theme.palette.primary.main};
	}

	&:hover {
		background-color: ${({ theme }) => theme.palette.primary.dark};
		text-decoration-line: none;
	}

	&:active {
		background-color: ${({ theme }) => theme.palette.primary.darkest};
	}
`;

export const secondaryButtonStyling = css`
	border: 1px solid ${({ theme }) => theme.palette.secondary.main};
	color: ${({ theme }) => theme.palette.secondary.main};
	line-height: 1;
	:hover {
		background-color: ${({ theme }) => theme.palette.secondary.main};
		color: ${({ theme }) => theme.palette.primary.contrast};
		text-decoration: none;
	}
`;
