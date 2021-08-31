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

import { AvatarComponent } from '@components/shared/avatar/avatar.styles';

export const StyledIconButton = styled(IconButton)`
	&& {
		margin: 8px 7px;
		padding: 0;
	}

	${({ disabled }) => disabled && css`
		&& {
		pointer-events: none;
			${AvatarComponent} {
				background-color: ${({ theme }) => theme.palette.secondary.mid};
				color: ${({ theme }) => theme.palette.secondary.light};
			}
		}
	`};

	&:hover {
		${AvatarComponent} {
			background-color: ${({ theme }) => theme.palette.tertiary.mid};
		}
	}

	&.Mui-focusVisible {
		${AvatarComponent} {
			height: 36px;
			width: 36px;
			border: 1px solid ${({ theme }) => theme.palette.primary.main};
		}
	}

	&:active {
		${AvatarComponent} {
			background-color: ${({ theme }) => theme.palette.tertiary.main};
		}
	}
`;
