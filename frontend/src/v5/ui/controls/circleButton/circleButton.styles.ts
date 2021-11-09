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
import { Fab } from '@material-ui/core';

const SIZE_MAP = {
	small: 22,
	medium: 28,
	large: 38,
};

const getButtonSize = (size) => {
	const buttonSize = SIZE_MAP[size];

	if (buttonSize) {
		return css`
			height: ${SIZE_MAP[size]}px;
			width: ${SIZE_MAP[size]}px;
		`;
	}

	return null;
};

const mainFabStyles = css`
	&& {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		border: none;

		path {
			stroke: ${({ theme }) => theme.palette.secondary.light};
		}

		${({ disabled }) => disabled && css`
			&& {
				path {
					fill: ${({ theme }) => theme.palette.secondary.light};
				}
			}
		`};

		&:hover, &.Mui-focusVisible {
			&& {
				background-color: transparent;
			}
		}

		&:active {
			&& {
				background-color: ${({ theme }) => theme.palette.base.lightest};
			}
		}
	}
`;

const contrastFabStyles = css`
	${({ disabled }) => disabled && css`
		&& {
			border-color: ${({ theme }) => theme.palette.secondary.light};
			pointer-events: none;

			path {
				fill: ${({ theme }) => theme.palette.secondary.light};
			}
		}
	`};

	&:hover {
		&& {
			background-color: ${({ theme }) => theme.palette.primary.contrast};
			path {
				fill: ${({ theme }) => theme.palette.secondary.main};
			}
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

export const StyledFab = styled(Fab)`
	${({ size }) => getButtonSize(size)};
	${({ $variant }) => $variant === 'main' && mainFabStyles}
	${({ $variant }) => $variant === 'contrast' && contrastFabStyles}
`;
