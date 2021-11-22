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
import { IconButton } from '@material-ui/core';
import styled, { css } from 'styled-components';

export const StyledIconButton = styled(IconButton)`
	height: 28px;
	width: 28px;
	padding: 0;
	margin: 0 10px 0 0;
	display: flex;
	align-items: center;

	svg {
		height: 7px;
		width: 100%;
		margin-top: 2px;
	}

	${({ $isOn }) => $isOn && css`
		background-color: ${({ theme }) => theme.palette.secondary.main};

		svg {
			margin-bottom: 3px;
			transform: rotate(180deg);

			path {
				fill: ${({ theme }) => theme.palette.primary.contrast};
			}
		}
	`}
	
	${({ $isLoading }) => $isLoading && css`
		pointer-events: none;
	`}

	border: 1px solid ${({ theme }) => theme.palette.secondary.main};

	&:hover {
		border-style: none;
		background-color: ${({ theme }) => theme.palette.base.lightest};
		
		svg {
			path {
				fill: ${({ theme }) => theme.palette.secondary.main};
			}
		}
	}

	&:active {
		background-color: ${({ theme }) => theme.palette.secondary.light};
	}

	&.Mui-focusVisible {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		border-style: solid;
	}

	:disabled {
		background-color: transparent;

		svg {
			path {
				fill: ${({ theme }) => theme.palette.base.light};
			}
		}
	}
`;
