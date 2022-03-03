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

import { IconButton } from '@mui/material';
import styled, { css } from 'styled-components';

export const StyledIconButton = styled(IconButton)`
	height: 36px;
	width: 36px;
	display: flex;
	align-items: center;

	${({ $isOn }) => $isOn && css`
			background-color: ${({ theme }) => theme.palette.tertiary.main};

			circle {
				fill: ${({ theme }) => theme.palette.primary.contrast};
			}
	`}
	
	&:hover {
		&& {
			background-color: ${({ theme }) => theme.palette.tertiary.lightest};

			circle {
				fill: ${({ theme }) => theme.palette.secondary.main};
			}
		}
	}

	&:active {
		&& {
			background-color: ${({ theme }) => theme.palette.base.lightest};

			circle {
				fill: ${({ theme }) => theme.palette.secondary.main};
			}
		}
	}

	&.Mui-focusVisible {
		&& {

			background-color: ${({ theme }) => theme.palette.tertiary.lightest};

			circle {
				fill: ${({ theme }) => theme.palette.secondary.main};
			}
		}
	}

	:disabled {
		&& {
			background-color: ${({ theme }) => theme.palette.primary.contrast};

			svg {
				circle {
					fill: ${({ theme }) => theme.palette.secondary.lightest};
				}
			}
		}
	}
`;
