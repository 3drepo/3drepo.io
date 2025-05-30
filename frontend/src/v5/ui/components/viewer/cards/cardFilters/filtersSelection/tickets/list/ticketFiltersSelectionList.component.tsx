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

import { SearchContext, SearchContextType } from '@controls/search/searchContext';
import { useContext } from 'react';
import { TicketFiltersSelectionItem } from './item/ticketFiltersSelectionItem.component';
import { FormattedMessage } from 'react-intl';
import { MenuList, EmptyListMessage, SearchWord } from './ticketFiltersSelectionList.styles';
import { CardFilter } from '../../../cardFilters.types';

type TicketFiltersSelectionListProps = {
	onFilterClick: (filter) => void;
};
export const TicketFiltersSelectionList = ({ onFilterClick }: TicketFiltersSelectionListProps) => {
	const { filteredItems, query } = useContext<SearchContextType<CardFilter>>(SearchContext);

	if (!filteredItems.length) return (
		<EmptyListMessage>
			<FormattedMessage
				id="viewer.card.tickets.filters.emptyList"
				defaultMessage="We couldn't find a match for {query}. Please try another search."
				values={{
					query: <SearchWord>&quot;{query}&quot;</SearchWord>,
				}}
			/>
		</EmptyListMessage>
	);

	return (
		<MenuList>
			{filteredItems.map((filter) => (
				<TicketFiltersSelectionItem
					{...filter}
					key={filter.module + filter.property + filter.type}
					onClick={() => onFilterClick(filter)}
				/>
			))}
		</MenuList>
	);
};