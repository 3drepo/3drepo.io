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

import { CardFilter } from '@components/viewer/cards/cardFilters/cardFilters.types';
import { TYPE_TO_ICON } from '../../ticketFilters.helpers';
import { ExpandIconContainer, MenuItem, TextOverflowContainer } from './ticketFiltersSelectionItem.styles';
import ChevronIcon from '@assets/icons/outlined/thin_chevron-outlined.svg';
import { Highlight } from '@controls/highlight';
import { useContext } from 'react';
import { SearchContext } from '@controls/search/searchContext';
import { FilterIconContainer } from '@components/viewer/cards/cardFilters/filterForm/filterFormValues/operators/filterFormOperators.styles';
import { getFilterFormTitle } from '@components/viewer/cards/cardFilters/cardFilters.helpers';

type TicketFiltersSelectionItemProps = CardFilter & {
	onClick: () => void;
};
export const TicketFiltersSelectionItem = ({ module, property, type, onClick }: TicketFiltersSelectionItemProps) => {
	const { query } = useContext(SearchContext);
	const Icon = TYPE_TO_ICON[type];

	return (
		<MenuItem onClick={onClick}>
			<FilterIconContainer>
				<Icon />
			</FilterIconContainer>
			<TextOverflowContainer tooltipText={getFilterFormTitle([module, property])}>
				{module && (<>
					<Highlight search={query}>{module}</Highlight>
					&nbsp;:&nbsp; 
				</>)}
				<Highlight search={query}>{property}</Highlight>
			</TextOverflowContainer>
			<ExpandIconContainer>
				<ChevronIcon />
			</ExpandIconContainer>
		</MenuItem>
	);
};