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
import { ButtonProps, ButtonTypeMap } from '@mui/material/Button';
import { CircularProgress } from '@mui/material';
import { MuiButton, ErrorButton, SuccessButton } from './button.styles';

export type IButton<T extends ElementType = ButtonTypeMap['defaultComponent']> = ButtonProps<T> & {
	className?: string;
	isPending?: boolean;
};

const ButtonBase = <T extends ElementType>({
	children,
	variant,
	color,
	isPending,
	...props
}: IButton<T>, ref: Ref<HTMLButtonElement>) => {
	if (color === 'error') {
		return (
			<ErrorButton {...props} ref={ref}>
				{children}
			</ErrorButton>
		);
	}

	if (color === 'success') {
		return (
			<SuccessButton {...props} ref={ref}>
				{children}
			</SuccessButton>
		);
	}

	if (isPending) {
		return (
			<MuiButton variant={variant} {...props} startIcon="" ref={ref}>
				<CircularProgress color="inherit" size="13px" thickness={7} />
			</MuiButton>
		);
	}

	return (
		<MuiButton variant={variant} {...props} ref={ref}>
			{children}
		</MuiButton>
	);
};

export const Button = forwardRef(ButtonBase);
