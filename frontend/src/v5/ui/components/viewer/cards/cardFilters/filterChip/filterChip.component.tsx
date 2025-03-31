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
import { ChipContainer, DeleteButton, TextWrapper, OperatorIconContainer, DisplayValue, Property } from './filterChip.styles';
import { FILTER_OPERATOR_ICON, getFilterOperatorLabels } from '../cardFilters.helpers';
import { Tooltip } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { CardFilterType, BaseFilter } from '../cardFilters.types';

type FilterChipProps = {
	property: string;
	type: CardFilterType,
	filter: BaseFilter,
	selected?: boolean;
	onDelete: () => void;
};
export const FilterChip = ({ property, onDelete, selected, type, filter }: FilterChipProps) => {
	const { operator, values, displayValues = values.join(', ') } = filter;
	const OperatorIcon = FILTER_OPERATOR_ICON[operator];
	const hasMultipleValues = values.length > 1;
	const labels = getFilterOperatorLabels(type);

	const handleDelete = (e) => {
		e.preventDefault();
		e.stopPropagation();
		onDelete();
	};

	return (
		<ChipContainer selected={selected}>
			<Tooltip title={`${property} ${labels[operator]} ${displayValues}`}>
				<TextWrapper>
					<Property>{property}</Property>
					<OperatorIconContainer>
						<OperatorIcon />
					</OperatorIconContainer>
					{hasMultipleValues && (
						<DisplayValue $multiple>
							<FormattedMessage id="cardFilter.valuesCount" defaultMessage="{count} values" values={{ count: values.length }} />
						</DisplayValue>
					)}
					{!hasMultipleValues && !!values?.length && (
						<DisplayValue>{displayValues}</DisplayValue>
					)}
				</TextWrapper>
			</Tooltip>
			<DeleteButton onClick={handleDelete}>
				<CloseIcon />
			</DeleteButton>
		</ChipContainer>
	);
};