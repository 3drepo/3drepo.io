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
import { Checkbox as CheckboxComponent } from '@material-ui/core';

const contrastStyles = css`
	path {
		fill: none;
		stroke: ${({ theme }) => theme.palette.secondary.light};
	}

	&:hover {
		&& {
			background-color: ${({ theme }) => theme.palette.primary.contrast};
		}
	}

	&.Mui-focusVisible {
		&& {
			border: 1px solid ${({ theme }) => theme.palette.primary.main};
			path {
				fill: ${({ theme }) => theme.palette.primary.main};
			}
		}
	}

	&:active {
		&& {
			background-color: ${({ theme }) => theme.palette.secondary.light};
			border-color: ${({ theme }) => theme.palette.secondary.light};

			path {
				fill: ${({ theme }) => theme.palette.secondary.main};
			}
		}
	}
`;

export const Checkbox = styled(CheckboxComponent)`
	&& {
		padding: 10px;

		svg {
			height: 16px;
			width: 16px;

			path {
				fill: none;
				stroke: ${({ theme }) => theme.palette.secondary.light};
			}
		}

		&.Mui-checked {
			path {
				fill: ${({ theme }) => theme.palette.favourite.main};
				stroke: ${({ theme }) => theme.palette.favourite.main};
			}
		}

		&.Mui-focusVisible {
			background-color: ${({ theme }) => theme.palette.tertiary.lightest};
		}

		&:hover {
			background-color: ${({ theme }) => theme.palette.tertiary.lightest};
		}

		&:active {
			background-color: ${({ theme }) => theme.palette.base.lightest};
		}

		&.Mui-disabled {
			path {
				fill: ${({ theme }) => theme.palette.secondary.lightest};
				stroke: ${({ theme }) => theme.palette.secondary.lightest};
			}
		}
	}

	${({ selected }) => selected && contrastStyles}
`;
