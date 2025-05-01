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
import { MenuItem, IconContainer, SearchInput } from './columnsVisibilitySettings.styles';
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

export const ColumnsVisibilitySettings = () => {
	const alreadyFetchedTicketIdAndProperty = useRef({});
	const { teamspace, project, template } = useParams<DashboardParams>();
	const isFed = FederationsHooksSelectors.selectIsFederation();
	const { visibleSortedColumnsNames, getAllColumnsNames, showColumn, hideColumn, isVisible } = useContext(ResizableTableContext);
	const { sortedItems: tickets } = useContext(SortedTableContext);
	const columnsNames = getAllColumnsNames();
	const { code: templateCode } = ProjectsHooksSelectors.selectCurrentProjectTemplateById(template);

	const filteringFunction = (cols, query) => (
		cols.filter((col) => matchesQuery(getColumnLabel(col), query))
	);

	const groupBySelected = (items: string[]) => {
		const groups = { selected: [], unselected: [] };
		items.forEach((item) => {
			if (isVisible(item)) {
				groups.selected.push(item);
			} else {
				groups.unselected.push(item);
			}
		});
		groups.selected = visibleSortedColumnsNames.filter((name) => groups.selected.includes(name));
		return groups;
	};

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
				<SearchContext.Consumer>
					{({ filteredItems }) => {
						const groupedItems = groupBySelected(filteredItems);
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
					}}
				</SearchContext.Consumer>
			</SearchContextComponent>
		</ActionMenu>
	);
};