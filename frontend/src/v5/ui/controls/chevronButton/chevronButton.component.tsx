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

import { forwardRef, Ref, type JSX } from 'react';
import ChevronIcon from '@assets/icons/outlined/chevron-outlined.svg';
import { IconButtonProps } from '@mui/material';
import { SpinnerLoader } from '@controls/spinnerLoader';
import { ChevronStyledIconButton } from './chevronButton.styles';

export type IChevronButton = IconButtonProps & {
	isOn?: boolean;
	isLoading?: boolean;
	size?: 'small' | 'medium' | 'large';
};

export const ChevronButton = forwardRef(({
	isOn,
	isLoading = false,
	size = 'medium',
	...props
}: IChevronButton, ref: Ref<HTMLButtonElement>): JSX.Element => (
	<ChevronStyledIconButton $isOn={isOn} $isLoading={isLoading} {...props} ref={ref} $size={size}>
		{isLoading ? (
			<SpinnerLoader />
		) : (
			<ChevronIcon />
		)}
	</ChevronStyledIconButton>
));
