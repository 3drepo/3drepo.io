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

import { Chip as ChipMui, ChipProps, ChipTypeMap } from '@mui/material';
import { ElementType } from 'react';
import styled, { css } from 'styled-components';

type ChipVariants = ChipProps['variant'] | 'label' | 'label-outlined';

export type ChipType<T extends ElementType = ChipTypeMap['defaultComponent']> = Omit<ChipProps<T>, 'variant'> & {
	variant?: ChipVariants,
	colour?: string,
};

const filledStyles = (colour: string) => css`
	color: ${({ theme }) => theme.palette.primary.contrast};
	background-color: ${colour};
	border-color: ${colour};
`;

const outlinedStyles = (colour: string) => css`
	color: ${colour};
	border-color: ${colour};
	background: 'transparent';
	svg: {
		color: ${colour};
	};
`;

const noBorderStyles = (colour: string) => css`
	border-color: transparent;
	background-color: transparent;
	color: ${colour};
	&:hover {
		text-decoration: underline;
		filter: brightness(75%);
	}
`;

export const Chip = styled(ChipMui)<ChipType>`
	${({ variant, colour = '#000' }) => {
		switch (variant) {
			case 'noBorder':
				return noBorderStyles(colour);
			case 'filled':
				return filledStyles(colour);
			default: // outlined
				return outlinedStyles(colour);
		}
	}}
`;

export const FilterChip = styled(Chip).attrs({
	clickable: false,
})<{ selected?: boolean }>`
	cursor: pointer;
	height: 18px;
	border-color: ${({ theme }) => theme.palette.base.main};
	color: ${({ theme }) => theme.palette.base.main};
	:hover {
		background-color: inherit;
		border-color: ${({ theme }) => theme.palette.primary.main};
		color: ${({ theme }) => theme.palette.primary.main};
	}
	${({ selected }) => selected && css`
		background-color: ${({ theme }) => theme.palette.primary.lightest};
		border-color: ${({ theme }) => theme.palette.primary.main};
		color: ${({ theme }) => theme.palette.primary.main};
		:hover {
			background-color: ${({ theme }) => theme.palette.primary.lightest};
		}
	`}
`;
