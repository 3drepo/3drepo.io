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

import MuiButtonBase from '@material-ui/core/Button';
import styled, { css } from 'styled-components';

export const MuiButton = styled(MuiButtonBase)`
	white-space: nowrap;
`;

export const labelButtonPrimaryStyles = css`
	color: ${({ theme }) =>
		theme.palette.primary.contrast};
	background-color: ${({ theme }) =>
		theme.palette.primary.main};

	&.Mui-focusVisible {
		background-color: ${({ theme }) =>
		theme.palette.primary.main};
	}

	&:hover {
		background-color: ${({ theme }) =>
		theme.palette.primary.dark};
		text-decoration-line: none;
	}

	&:active {
		background-color: ${({ theme }) =>
		theme.palette.primary.darkest};
	}
`;

export const labelButtonSecondaryStyles = css`
	color: ${({ theme }) =>
		theme.palette.tertiary.main};
	background-color: ${({ theme }) =>
		theme.palette.tertiary.lightest};

	&.Mui-focusVisible {
		background-color: ${({ theme }) =>
		theme.palette.tertiary.lightest};
	}

	&:hover {
		background-color: ${({ theme }) =>
		theme.palette.tertiary.main};
		text-decoration-line: none;
		color: ${({ theme }) =>
		theme.palette.primary.contrast};
	}

	&:active {
		background-color: ${({ theme }) =>
		theme.palette.tertiary.dark};
		color: ${({ theme }) =>
		theme.palette.primary.contrast};
	}
`;

export const labelOutlinedButtonPrimaryStyles = css`
	color: ${({ theme }) =>
		theme.palette.primary.main};
	background-color: ${({ theme }) =>
		theme.palette.primary.contrast};
	border: 1px solid ${({ theme }) =>
		theme.palette.primary.main};

	&:hover {
		color: ${({ theme }) =>
		theme.palette.primary.contrast};
		border-color: ${({ theme }) =>
		theme.palette.primary.dark};
	}

	&:active {
		border-color: ${({ theme }) =>
		theme.palette.primary.darkest};
	}

	&.Mui-focusVisible {
		color: ${({ theme }) =>
		theme.palette.primary.main};
		background-color: ${({ theme }) =>
		theme.palette.primary.contast};
	}

	&:disabled {
		border-color: ${({ theme }) =>
		theme.palette.base.lightest};
	}
`;

export const labelOutlinedButtonSecondaryStyles = css`
	color: ${({ theme }) =>
		theme.palette.tertiary.main};
	background-color: ${({ theme }) =>
		theme.palette.primary.contrast};
	border: 1px solid ${({ theme }) =>
		theme.palette.tertiary.main};

	:active {
		border-color: ${({ theme }) =>
		theme.palette.tertiary.dark};
	}

	&.Mui-focusVisible {
		background-color: ${({ theme }) =>
		theme.palette.tertiary.lightest};
	}

	&:disabled {
		border-color: ${({ theme }) =>
		theme.palette.base.lightest};
	}
`;

export const LabelButton = styled(MuiButton)`
	align-items: center;
	padding: 8px 12px 8px 15px;

	${({ theme }) =>
		css`
		&:disabled {
			background-color: ${theme.palette.base.lightest};
			color: ${theme.palette.primary.contrast};
		}

		&.Mui-focusVisible {
			box-shadow: ${theme.palette.shadows.level_5};
		}
	`}

	${({ color }) => {
		if (color === 'primary') {
			return labelButtonPrimaryStyles;
		}
		if (color === 'secondary') {
			return labelButtonSecondaryStyles;
		}
		return '';
	}}

	${({ color, outlined }) => {
		if (color === 'primary' && outlined) {
			return labelOutlinedButtonPrimaryStyles;
		}
		if (color === 'secondary' && outlined) {
			return labelOutlinedButtonSecondaryStyles;
		}
		return '';
	}}
`;

export const ErrorButton = styled(MuiButton).attrs({
	variant: 'outlined',
})`
	height: 35px;
	color: ${({ theme }) =>
		theme.palette.error.main};
	border-color: ${({ theme }) =>
		theme.palette.error.main};

	&.Mui-focusVisible {
		background-color: ${({ theme }) =>
		theme.palette.error.main};
	}

	&:hover {
		color: ${({ theme }) =>
		theme.palette.error.contrastText};
		background-color: ${({ theme }) =>
		theme.palette.error.main};
		text-decoration-line: none;
	}

	&:active {
		color: ${({ theme }) =>
		theme.palette.error.contrastText};
		border-color: ${({ theme }) =>
		theme.palette.error.dark};
		background-color: ${({ theme }) =>
		theme.palette.error.dark};
	}
`;
