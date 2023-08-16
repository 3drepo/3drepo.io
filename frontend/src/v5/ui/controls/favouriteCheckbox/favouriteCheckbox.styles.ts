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
import { Checkbox as CheckboxComponent } from '@mui/material';

const contrastStyles = css`
	svg path {
		stroke: ${({ theme }) => theme.palette.secondary.light};
	}
`;

export const Checkbox = styled(CheckboxComponent)<{ selected?: boolean }>`
	padding: 10px;
	background-color: transparent;

	svg {
		height: 16px;
		width: 16px;
		color: ${({ theme }) => theme.palette.favourite.main};

		path {
			fill: none;
			stroke: ${({ theme }) => theme.palette.secondary.light};
		}
	}

	&:is(:hover, :active, .Mui-focusVisible, .Mui-checked) path {
		fill: ${({ theme }) => theme.palette.favourite.main};
		stroke: ${({ theme }) => theme.palette.favourite.main};
	}

	&:not(.Mui-checked):hover {
		color: ${({ theme }) => theme.palette.favourite.main};

		& path {
			fill: transparent;
		}
	}

	&.Mui-disabled path {
		fill: ${({ theme }) => theme.palette.secondary.lightest};
		stroke: ${({ theme }) => theme.palette.secondary.lightest};
	}

	${({ selected }) => selected && contrastStyles}
`;
