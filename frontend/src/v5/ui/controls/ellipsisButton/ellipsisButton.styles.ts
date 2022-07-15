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

const PrimaryStyles = ($isOn: boolean) => css`
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	svg circle {
		fill: ${({ theme }) => theme.palette.tertiary.darkest};
	}
	${$isOn && css`
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	`}
	&:hover, &.Mui-focusVisible {
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	}
	:disabled {
		svg circle {
			fill: ${({ theme }) => theme.palette.secondary.lightest};
		}
	}
`;

const SecondaryStyles = ($isOn: boolean) => css`
	background-color: ${({ theme }) => theme.palette.tertiary.darkest};
	svg circle {
		fill: ${({ theme }) => theme.palette.primary.contrast};
	}
	${$isOn && css`
		background-color: ${({ theme }) => theme.palette.secondary.light};
	`}
	&:hover, &.Mui-focusVisible {
		background-color: ${({ theme }) => theme.palette.secondary.light};
	}
	:disabled {
		svg circle {
			fill: ${({ theme }) => theme.palette.secondary.light};
		}
	}
`;

export const StyledIconButton = styled(IconButton)<{ $isOn?: boolean; variant?: 'primary' | 'secondary' }>`
	height: 36px;
	width: 36px;
	display: flex;
	align-items: center;
	${({ variant, $isOn }) => (variant === 'primary' ? PrimaryStyles($isOn) : SecondaryStyles($isOn))};
`;
