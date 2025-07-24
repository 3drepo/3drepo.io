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
import StarIcon from '@assets/icons/filled/star-filled.svg';
import { CheckboxProps, Tooltip } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { Checkbox } from './favouriteCheckbox.styles';

interface IFavouriteCheckbox extends Omit<CheckboxProps, 'icon' | 'checkedIcon'> {
	selected?: boolean;
}

export const FavouriteCheckbox = forwardRef(
	({ selected = false, ...props }: IFavouriteCheckbox, ref: Ref<HTMLButtonElement>): JSX.Element => (
		<Tooltip
			title={
				props.checked
					? <FormattedMessage id="favouriteCheckbox.removeTooltip" defaultMessage="Remove from favourites" />
					: <FormattedMessage id="favouriteCheckbox.addTooltip" defaultMessage="Add to favourites" />
			}
		>
			<Checkbox
				icon={<StarIcon />}
				checkedIcon={<StarIcon />}
				ref={ref}
				selected={selected}
				onClick={(event) => {
					event.stopPropagation();
				}}
				{...props}
			/>
		</Tooltip>
	),
);
