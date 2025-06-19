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
import { getColumnLabel, INITIAL_COLUMNS } from '../../../ticketsTable.helper';
import { SearchInputContainer } from '@controls/searchSelect/searchSelect.styles';
import { MenuItem, IconContainer, SearchInput, EmptyListMessageContainer } from './columnsVisibilitySettings.styles';
import { Checkbox } from '@controls/inputs/checkbox/checkbox.component';
import { useContext, useEffect, useRef } from 'react';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { matchesQuery } from '@controls/search/searchContext.helpers';
import { formatMessage } from '@/v5/services/intl';
import { Divider } from '@mui/material';
import { TextOverflow } from '@controls/textOverflow';
import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useParams } from 'react-router';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { FederationsHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { SortedTableContext } from '@controls/sortedTableContext/sortedTableContext';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { FormattedMessage } from 'react-intl';
import { SearchWord } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/list/ticketFiltersSelectionList.styles';
import { useContextWithCondition } from '@/v5/helpers/contextWithCondition/contextWithCondition.hooks';

const List = ({ onShowColumn }) => {
	const { filteredItems, query } = useContext(SearchContext);
	const { visibleSortedColumnsNames, hideColumn, isVisible } = useContextWithCondition(ResizableTableContext, ['visibleSortedColumnsNames']);

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
	const alreadyFetchedTicketIdAndProperty = useRef({});
	const { teamspace, project, template } = useParams<DashboardParams>();
	const { code: templateCode } = ProjectsHooksSelectors.selectCurrentProjectTemplateById(template);
	const isFed = FederationsHooksSelectors.selectIsFederation();
	const { visibleSortedColumnsNames, getAllColumnsNames, showColumn } = useContextWithCondition(ResizableTableContext, ['visibleSortedColumnsNames']);
	const { sortedItems: tickets } = useContext(SortedTableContext);
	const columnsNames = getAllColumnsNames();
	const ticketsAreInSyncWithTemplate = tickets[0]?._id === template;

	const filteringFunction = (cols, query) => (
		cols.filter((col) => matchesQuery(getColumnLabel(col), query))
	);

	const nameToExtraPropertyToFetch = (name) => name
		.replace(/properties\./, '')
		.replace(/modules\./, '');

	const fetchColumn = (name) => tickets.forEach(({ modelId, _id: ticketId }) => {
		const ticketIdAndProperty = `${ticketId}${name}`;
		if (alreadyFetchedTicketIdAndProperty.current[ticketIdAndProperty]) return;
		alreadyFetchedTicketIdAndProperty.current[ticketIdAndProperty] = ticketIdAndProperty;
			
		const isFederation = isFed(modelId);
		TicketsActionsDispatchers.fetchTicketProperties(
			teamspace,
			project,
			modelId,
			ticketId,
			templateCode,
			isFederation,
			[nameToExtraPropertyToFetch(name)],
		);
	});

	const onShowColumn = (name) => {
		if (!INITIAL_COLUMNS.includes(name)) {
			fetchColumn(name);
		}
		showColumn(name);
	};

	useEffect(() => {
		if (!ticketsAreInSyncWithTemplate) return;
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