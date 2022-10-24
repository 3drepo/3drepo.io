/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { Chip, ChipProps } from '@mui/material';
import styled, { css } from 'styled-components';

export type ChipType = Omit<ChipProps, 'color'> & {
	$variant: 'text' | 'outlined' | 'filled';
	color?: string;
	$coloroverride: string;
};

const filledStyles = (color: string) => css`
	color: ${({ theme }) => theme.palette.primary.contrast};
	background-color: ${color};
	border-color: ${color};
`;

const outlinedStyles = (color: string) => css`
	color: ${color};
	border: 1px solid ${color};
	background: transparent;
	svg {
		color: ${color};
	}
`;

const textStyles = (color: string) => css`
	border-color: transparent;
	background-color: transparent;
	color: ${color};
	&:hover {
		text-decoration: underline;
		filter: brightness(75%);
	}
`;

export const ChipBase = styled(Chip)<ChipType>`
	${({ $variant, $coloroverride }) => {
		switch ($variant) {
			case 'text':
				return textStyles($coloroverride);
			case 'filled':
				return filledStyles($coloroverride);
			default: // outlined
				return outlinedStyles($coloroverride);
		}
	}}
`;

export const FilterChip = styled(Chip).attrs({
	clickable: false,
})<{ selected?: boolean }>`
	cursor: pointer;
	height: 18px;
	color: ${({ theme }) => theme.palette.base.main};
	border: 1px solid currentColor;
	background-color: none;
	:hover {
		background-color: inherit;
		color: ${({ theme }) => theme.palette.primary.main};
	}
	${({ selected }) => selected && css`
		background-color: ${({ theme }) => theme.palette.primary.lightest};
		color: ${({ theme }) => theme.palette.primary.main};
		:hover {
			background-color: ${({ theme }) => theme.palette.primary.lightest};
		}
	`}
`;
