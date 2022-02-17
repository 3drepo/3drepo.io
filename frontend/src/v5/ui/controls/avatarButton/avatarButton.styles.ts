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
import { IconButton } from '@material-ui/core';

export const StyledIconButton = styled(IconButton)`
	&& {
		padding: 0;
		margin: 8px 7px;
	}

	.MuiAvatar-circle {
		margin: 0;
		height: 38px;
		width: 38px;
	}

	${({ disabled }) => disabled && css`
		&& {
		pointer-events: none;
			.MuiAvatar-root {
				background-color: ${({ theme }) => theme.palette.secondary.mid};
				color: ${({ theme }) => theme.palette.secondary.light};
			}
		}
	`};

	&.Mui-focusVisible {
		.MuiAvatar-root {
			outline: 1px solid ${({ theme }) => theme.palette.primary.main};
			box-shadow: 
				0px 3px 5px -1px rgb(0 0 0 / 20%),
				0px 6px 10px 0px rgb(0 0 0 / 14%),
				0px 1px 18px 0px rgb(0 0 0 / 12%);
		}
	}
	
	&:hover {
		.MuiAvatar-root {
			background-color: ${({ theme }) => theme.palette.tertiary.mid};
		}
	}

	&:active {
		.MuiAvatar-root {
			background-color: ${({ theme }) => theme.palette.tertiary.main};
		}
	}
`;
