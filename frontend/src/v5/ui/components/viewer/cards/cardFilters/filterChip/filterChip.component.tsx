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
import { ChipContainer, DeleteButton, TextWrapper, OperatorIconContainer } from './filterChip.styles';
import { FILTER_OPERATOR_ICON, FILTER_OPERATOR_LABEL } from './filters.helpers';
import { Tooltip } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { CardFilterOperator } from '../cardFilters.types';

type FilterChipProps = {
	property: string;
	values: any[];
	onDelete: () => void;
	operator: CardFilterOperator;
	selected?: boolean;
};
export const FilterChip = ({ property, values, onDelete, operator, selected }: FilterChipProps) => {
	const OperatorIcon = FILTER_OPERATOR_ICON[operator];
	const hasMultipleValues = values.length > 1;
	const displayValues = values?.join(', ') ?? '';

	return (
		<ChipContainer selected={selected}>
			<TextWrapper>
				<span>{property}</span>
				<Tooltip title={FILTER_OPERATOR_LABEL[operator]}>
					<OperatorIconContainer>
						<OperatorIcon />
					</OperatorIconContainer>
				</Tooltip>
				{hasMultipleValues && (
					<Tooltip title={displayValues}>
						<u>
							<FormattedMessage id="cardFilter.valuesCount" defaultMessage="{count} values" values={{ count: values.length }} />
						</u>
					</Tooltip>
				)}
				{!hasMultipleValues && !!values.length && (
					<span>{displayValues}</span>
				)}
			</TextWrapper>
			<DeleteButton onClick={onDelete}>
				<CloseIcon />
			</DeleteButton>
		</ChipContainer>
	);
};