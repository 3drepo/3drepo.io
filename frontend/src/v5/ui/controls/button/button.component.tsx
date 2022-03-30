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

import { ElementType, forwardRef, Ref } from 'react';
import { Typography } from '@/v5/ui/controls/typography';
import { ButtonTypeMap } from '@mui/material/Button/Button';
import { ButtonProps } from '@mui/material/Button';
import { CircularProgress } from '@mui/material';
import { MuiButton, ErrorButton, LabelButton } from './button.styles';

type ButtonVariants = ButtonProps['variant'] | 'label' | 'label-outlined';

export type IButton<T extends ElementType = ButtonTypeMap['defaultComponent']> = Omit<ButtonProps<T>, 'variant'> & {
	variant?: ButtonVariants;
	className?: string;
	errorButton?: boolean;
	isPending?: boolean;
};

export const ButtonBase = <T extends ElementType>({
	children,
	variant,
	errorButton,
	isPending,
	...props
}: IButton<T>, ref: Ref<HTMLButtonElement>): JSX.Element => {
	if (errorButton) {
		return (
			<ErrorButton {...props} ref={ref}>
				{children}
			</ErrorButton>
		);
	}
	if (variant === 'label') {
		return (
			<LabelButton {...props} ref={ref}>
				<Typography variant="kicker">{children}</Typography>
			</LabelButton>
		);
	}
	if (variant === 'label-outlined') {
		return (
			<LabelButton outlined {...props} ref={ref}>
				<Typography variant="kicker">{children}</Typography>
			</LabelButton>
		);
	}

	return isPending
		? (
			<MuiButton variant={variant} {...props} startIcon="" ref={ref}>
				<CircularProgress color="inherit" size="13px" thickness={7} />
			</MuiButton>
		)
		: (
			<MuiButton variant={variant} {...props} ref={ref}>
				{ children }
			</MuiButton>
		);
};

export const Button = forwardRef(ButtonBase);
