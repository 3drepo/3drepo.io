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

		${({ $isButton, theme }) => ($isButton ? `
			cursor: pointer;
			
			&:hover {
				.MuiAvatar-root {
					background-color: ${theme.palette.tertiary.mid};
				}
			}

			&:active {
				.MuiAvatar-root {
					background-color: ${theme.palette.tertiary.main};
				}
			}
		` : `
			cursor: default;
		`)}
	}

	.MuiAvatar-circle {
		margin: 0;
		${({ $largeIcon }) => `
			height: ${$largeIcon ? '48px' : '38px'};
			width: ${$largeIcon ? '48px' : '38px'};
		`}
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
				0 3px 5px -1px rgb(0 0 0 / 20%),
				0 6px 10px 0 rgb(0 0 0 / 14%),
				0 1px 18px 0 rgb(0 0 0 / 12%);
		}
	}
`;
