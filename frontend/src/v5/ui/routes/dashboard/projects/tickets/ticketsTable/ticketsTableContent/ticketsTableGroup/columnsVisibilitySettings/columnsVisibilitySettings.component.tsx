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

import { usePerformanceContext } from '@/v5/helpers/performanceContext/performanceContext.hooks';
import { getState } from '@/v5/helpers/redux.helpers';
import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { FederationsHooksSelectors, ProjectsHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { selectPropertyFetched } from '@/v5/store/tickets/tickets.selectors';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import GearIcon from '@assets/icons/outlined/gear-outlined.svg';
import { SearchWord } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/list/ticketFiltersSelectionList.styles';
import { ActionMenu } from '@controls/actionMenu';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { Checkbox } from '@controls/inputs/checkbox/checkbox.component';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { SearchContext, SearchContextComponent } from '@controls/search/searchContext';
import { matchesQuery } from '@controls/search/searchContext.helpers';
import { SearchInputContainer } from '@controls/searchSelect/searchSelect.styles';
import { SortedTableContext, SortedTableType } from '@controls/sortedTableContext/sortedTableContext';
import { TextOverflow } from '@controls/textOverflow';
import { Divider } from '@mui/material';
import { chunk } from 'lodash';
import { useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';
import { getColumnLabel, INITIAL_COLUMNS } from '../../../ticketsTable.helper';
import { EmptyListMessageContainer, IconContainer, MenuItem, SearchInput } from './columnsVisibilitySettings.styles';

const List = ({ onShowColumn }) => {
	const { filteredItems, query } = useContext(SearchContext);
	const { visibleSortedColumnsNames, hideColumn, isVisible } = usePerformanceContext(ResizableTableContext, ['visibleSortedColumnsNames']);

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
						disabled={visibleSortedColumnsNames.length === 1}
						onChange={() => hideColumn(columnName)}
						value={true}
						label={<TextOverflow>{getColumnLabel(columnName)}</TextOverflow>}
					/>
				</MenuItem>
			))}
			{groupedItems.unselected.length > 0 && <Divider />}
			{groupedItems.unselected.map((columnName) => (
				<MenuItem key={columnName}>
					<Checkbox
						onChange={() => onShowColumn(columnName)}
						value={false}
						label={<TextOverflow>{getColumnLabel(columnName)}</TextOverflow>}
					/>
				</MenuItem>
			))}
		</>
	);
};

export const ColumnsVisibilitySettings = () => {
	const { getAllColumnsNames, showColumn, visibleSortedColumnsNames } = usePerformanceContext(ResizableTableContext, ['visibleSortedColumnsNames', 'columnsWidths']);
	const columnsNames = getAllColumnsNames();
	const isFed = FederationsHooksSelectors.selectIsFederation();
	const { teamspace, project, template } = useParams<DashboardParams>();
	const { code: templateCode } = ProjectsHooksSelectors.selectCurrentProjectTemplateById(template);
	const { sortedItems: tickets, sortingColumn, refreshSorting } = useContext(SortedTableContext as React.Context<SortedTableType<ITicket>>);

	const nameToExtraPropertyToFetch = (name) => name
		.replace(/properties\./, '')
		.replace(/modules\./, '');

	const fetchColumn = (name) => {
		const idsByModelId = tickets
			.filter(({ _id }) => !selectPropertyFetched(getState(), _id, nameToExtraPropertyToFetch(name)))
			.reduce((acc, { _id: ticketId, modelId }) => {
				if (!acc[modelId]) {
					acc[modelId] = [];
				}
				acc[modelId].push(ticketId);
				return acc;
			},  {} ) as Record<string, string[]>;

		Object.keys(idsByModelId).map((modelId) => {
			const ids = idsByModelId[modelId];
			const isFederation = isFed(modelId);
			const chunks = chunk(ids, 200);
			chunks.forEach((idsChunk) => {
				TicketsActionsDispatchers.fetchTicketsProperties(
					teamspace,
					project,
					modelId,
					idsChunk,
					templateCode,
					isFederation,
					[nameToExtraPropertyToFetch(name)],
				);
			});
		});
	};

	const filteringFunction = (cols, query) => (
		cols.filter((col) => matchesQuery(getColumnLabel(col), query))
	);

	const onShowColumn = (name) => {
		showColumn(name);
	};

	const ticketsIds = tickets.map(({ _id }) => _id);

	const orderingColumnPropertiesFetched = TicketsHooksSelectors.selectPropertyFetchedForTickets(ticketsIds, nameToExtraPropertyToFetch(sortingColumn));

	useEffect(() => {
		if (!orderingColumnPropertiesFetched) return;
		refreshSorting();
	}, [orderingColumnPropertiesFetched]);

	useEffect(() => {
		visibleSortedColumnsNames
			.filter((name) => !INITIAL_COLUMNS.includes(name))
			.forEach(fetchColumn);
	}, [visibleSortedColumnsNames, tickets]);

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
				<List onShowColumn={onShowColumn} />
			</SearchContextComponent>
		</ActionMenu>
	);
};