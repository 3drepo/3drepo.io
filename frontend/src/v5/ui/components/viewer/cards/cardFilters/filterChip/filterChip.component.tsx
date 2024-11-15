/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import CloseIcon from '@assets/icons/outlined/close-outlined.svg';
import { ChipContainer, DeleteButton, TextWrapper, FilterIconContainer } from './filterChip.styles';
import { FILTER_ICON, FILTER_LABEL, FilterType } from './filters.helpers';
import { Tooltip } from '@mui/material';
import { FormattedMessage } from 'react-intl';

type FilterChipProps = {
	property: string;
	values: string[];
	onDelete: () => void;
	type: FilterType;
	selected?: boolean;
};
export const FilterChip = ({ property, values, onDelete, type, selected }: FilterChipProps) => {
	const FilterIcon = FILTER_ICON[type];
	const hasMultipleValues = values.length > 1;

	return (
		<ChipContainer selected={selected}>
			<TextWrapper>
				{property}
				<Tooltip title={FILTER_LABEL[type]}>
					<FilterIconContainer>
						<FilterIcon />
					</FilterIconContainer>
				</Tooltip>
				{hasMultipleValues
					? (
						<Tooltip title={values.join(', ')}>
							<u>
								<FormattedMessage id="cardFilter.valuesCount" defaultMessage="{count} values" values={{ count: values.length }} />
							</u>
						</Tooltip>
					) : values[0]
				}
			</TextWrapper>
			<DeleteButton onClick={onDelete}>
				<CloseIcon />
			</DeleteButton>
		</ChipContainer>
	);
};