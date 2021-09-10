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
import React from 'react';
import { Typography as MuiTypography, TypographyProps, TypographyVariant } from '@material-ui/core';
import { KickerTypography, KickerTitleTypography } from './typography.styles';

type ITypographyVariants = TypographyVariant | 'kicker' | 'kickerTitle';

type ITypography = Omit<TypographyProps, 'variant'> & {
	variant: ITypographyVariants;
};

export const Typography = ({ variant, children, ...props }: ITypography): JSX.Element => {
	if (variant === 'kicker') {
		return <KickerTypography {...props}>{children}</KickerTypography>;
	}
	if (variant === 'kickerTitle') {
		return <KickerTitleTypography {...props}>{children}</KickerTitleTypography>;
	}
	return <MuiTypography variant={variant} {...props}>{children}</MuiTypography>;
};
