/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import GearIcon from '@assets/icons/outlined/gear-outlined.svg';
import { ActionMenu } from '@controls/actionMenu';
import { SearchContext, SearchContextComponent } from '@controls/search/searchContext';
import { getPropertyLabel } from '../../../ticketsTable.helper';
import { SearchInputContainer } from '@controls/searchSelect/searchSelect.styles';
import { MenuItem, IconContainer, SearchInput, EmptyListMessageContainer } from './columnsVisibilitySettings.styles';
import { Checkbox } from '@controls/inputs/checkbox/checkbox.component';
import { useContext, useEffect } from 'react';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { matchesQuery } from '@controls/search/searchContext.helpers';
import { formatMessage } from '@/v5/services/intl';
import { Divider } from '@mui/material';
import { TextOverflow } from '@controls/textOverflow';
import { SortedTableContext, SortedTableType } from '@controls/sortedTableContext/sortedTableContext';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { FormattedMessage } from 'react-intl';
import { SearchWord } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/list/ticketFiltersSelectionList.styles';
import { useContextWithCondition } from '@/v5/helpers/contextWithCondition/contextWithCondition.hooks';
import { TicketsTableContext } from '../../../ticketsTableContext/ticketsTableContext';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { ITicket } from '@/v5/store/tickets/tickets.types';

const List = () => {
	const { filteredItems, query } = useContext(SearchContext);
	const { visibleSortedColumnsNames, hideColumn, showColumn, isVisible } = useContextWithCondition(ResizableTableContext, ['visibleSortedColumnsNames']);
	const { groupBy } = useContext(TicketsTableContext);

	const onShowColumn = (name) => {
		showColumn(name);
	};

	const groupBySelected = () => {
		const groups = { selected: [], unselected: [] };
		filteredItems.forEach((item) => {
			if (isVisible(item)) {
				groups.selected.push(item);
			} else {
				groups.unselected.push(item);
			}
		});
		groups.selected = visibleSortedColumnsNames.filter((name) => groups.selected.includes(name));
		return groups;
	};

	const groupedItems = groupBySelected();

	if (!filteredItems.length) return (
		<EmptyListMessageContainer>
			<EmptyListMessage>
				<FormattedMessage
					id="viewer.card.tickets.columns.emptyList"
					defaultMessage="We couldn't find a match for {query}. Please try another search."
					values={{
						query: <SearchWord>&quot;{query}&quot;</SearchWord>,
					}}
				/>
			</EmptyListMessage>
		</EmptyListMessageContainer>
	);

	return (
		<>
			{groupedItems.selected.map((columnName) => (
				<MenuItem key={columnName}>
					<Checkbox
						disabled={visibleSortedColumnsNames.length === 1 || columnName === groupBy}
						onChange={() => hideColumn(columnName)}
						value={true}
						label={<TextOverflow>{getPropertyLabel(columnName)}</TextOverflow>}
					/>
				</MenuItem>
			))}
			{groupedItems.unselected.length > 0 && <Divider />}
			{groupedItems.unselected.map((columnName) => (
				<MenuItem key={columnName}>
					<Checkbox
						onChange={() => onShowColumn(columnName)}
						value={false}
						label={<TextOverflow>{getPropertyLabel(columnName)}</TextOverflow>}
					/>
				</MenuItem>
			))}
		</>
	);
};
export const ColumnsVisibilitySettings = () => {
	const { getAllColumnsNames } = useContextWithCondition(ResizableTableContext, ['visibleSortedColumnsNames']);
	const columnsNames = getAllColumnsNames();
	const { sortedItems: tickets, sortingColumn, refreshSorting } = useContext(SortedTableContext as React.Context<SortedTableType<ITicket>>);

	const nameToExtraPropertyToFetch = (name) => name
		.replace(/properties\./, '')
		.replace(/modules\./, '');

	const filteringFunction = (cols, query) => (
		cols.filter((col) => matchesQuery(getPropertyLabel(col), query))
	);
	const ticketsIds = tickets.map(({ _id }) => _id);

	const orderingColumnPropertiesFetched = TicketsHooksSelectors.selectPropertyFetchedForTickets(ticketsIds, nameToExtraPropertyToFetch(sortingColumn));

	useEffect(() => {
		if (!orderingColumnPropertiesFetched) return;
		refreshSorting();
	}, [orderingColumnPropertiesFetched]);

	return (
		<ActionMenu
			TriggerButton={(
				<IconContainer>
					<GearIcon />
				</IconContainer>
			)}
			PopoverProps={{
				transformOrigin: {
					vertical: 'top',
					horizontal: 'left',
				},
			}}
			useMousePosition
		>
			<SearchContextComponent items={columnsNames} filteringFunction={filteringFunction}>
				<SearchInputContainer>
					<SearchInput
						placeholder={formatMessage({ id: 'ticketsTable.columnsVisibilitySettings.search.placeholder', defaultMessage: 'Search...' })}
					/>
				</SearchInputContainer>
				<List />
			</SearchContextComponent>
		</ActionMenu>
	);
};