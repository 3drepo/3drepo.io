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
	variant: ChipVariants,
	colour: string,
};

const filledStyles = (colour) => css`
	color: ${({ theme }) => theme.palette.primary.contrast};
	background-color: ${colour};
`;

const outlinedStyles = (colour) => css`
	color: ${colour};
	border-color: ${colour};
	background: 'transparent';
	svg: {
		color: ${colour};
	};
`;

const noBorderStyles = (colour) => css`
	border-color: transparent;
	background-color: transparent;
	color: ${colour};
	&:hover {
		text-decoration: underline;
	};
`;

export const Chip = styled(ChipMui)<ChipType>`
	${({ variant, colour }) => {
		switch (variant) {
			case 'noBorder':
				return noBorderStyles(colour);
			case 'filled':
				return filledStyles(colour);
			default: // outlined
				return outlinedStyles(colour);
		}
	}
};
`;
