/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { formatMessage } from '@/v5/services/intl';
import { TicketFilter } from '@components/viewer/cards/cardFilters/cardFilters.types';
import { CardFilterActionMenu } from '@components/viewer/cards/cardFilters/filterForm/filterForm.styles';
import { TicketFiltersSelectionList } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/list/ticketFiltersSelectionList.component';
import { TicketsFiltersModal, TicketsFiltersModalItem, TicketsFiltersSearchInput } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFiltersSelection.styles';
import { SearchContextComponent } from '@controls/search/searchContext';
import { PopoverOrigin, PopoverProps } from '@mui/material';
import { useContext, useState } from 'react';
import { ActionMenuButton } from '../ticketsList.styles';
import { FormattedMessage } from 'react-intl';
import { TicketsBulkEditForm } from '@components/shared/ticketsBulkEdit/ticketsBulkEditForm.component';
import { TicketsBulkUpdateContext } from '@components/tickets/bulkUpdate/bulkUpdate.context';
import { templatesToFilters } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { getState } from '@/v5/helpers/redux.helpers';
import { selectTemplateById } from '@/v5/store/tickets/tickets.selectors';
import { useParams } from 'react-router';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { ITemplate } from '@/v5/store/tickets/tickets.types';
import { canBulkEditProperty } from '@/v5/store/tickets/tickets.helpers';

// HACK: reconstructing the property name until refactor of properties list is done to just use 
// the property name instead of filters
const propertyNameFromFilter = (filter: TicketFilter) => {
	let propertyName = filter.module ? `modules.${filter.module}.${filter.property}` : `properties.${filter.property}`;

	// in the case of description is not in the properties field

	if (filter.property === 'description') { 
		propertyName = 'description';
	}

	if (filter.type === 'title') {
		propertyName = 'title';
	}

	if (filter.type === 'ticketCode') {
		propertyName = 'id';
	}

	return propertyName;
};

export const BulkUpdateDropdown = () => {
	const { containerOrFederation } = useParams<ViewerParams>();
	const filteredTickets = TicketsCardHooksSelectors.selectFilteredTickets();
	
	const [selectedFilter, setSelectedFilter] = useState<TicketFilter>(null);
	const showFiltersList = !selectedFilter?.property;
	const { selectedItems: selectedContextItems } = useContext(TicketsBulkUpdateContext);

	const templatesSet = new Set<ITemplate>();
	const state = getState();

	// If the tickets get updated and the filtering filters them out 
	// the selectedItems must be filtered also.
	const selectedItems = new Set<string>();

	filteredTickets.forEach((ticket) => {
		if (selectedContextItems.has(ticket._id) ) {
			const template = selectTemplateById(state, containerOrFederation, ticket.type);
			templatesSet.add(template);
			selectedItems.add(ticket._id);
		}
	});

	const templates = Array.from(templatesSet);

	const selectableItems = templatesToFilters(templates).filter((filter) => {
		return templates.find((template) => canBulkEditProperty(template, propertyNameFromFilter(filter)));
	});
	
	const clearFilter = () => setSelectedFilter(null);
    
	const anchorOrigin: PopoverOrigin = {
		vertical: 'bottom',
		horizontal: 'right',
	};
            
	const transformOrigin: PopoverOrigin = {
		vertical: 'top',
		horizontal: 'right',
	};

	const disabled = !selectedItems.size;
	const popoverProps: Partial<PopoverProps> = { anchorOrigin, transformOrigin, marginThreshold: 20 };

	const selectedProperty = selectedFilter ? propertyNameFromFilter(selectedFilter) : '';

	return (
		<CardFilterActionMenu
			TriggerButton={
				<ActionMenuButton variant="outlined" color="secondary" disabled={disabled}>
					<FormattedMessage id="viewer.cards.tickets.bulkUpdateButton" defaultMessage="Bulk Update" />
				</ActionMenuButton>
			}
			onClose={clearFilter}
			disabled={disabled}
			PopoverProps={popoverProps}
			$displayMode="card"
		>
			<TicketsFiltersModal $visibleIndex={showFiltersList ? 0 : 1}>
				<TicketsFiltersModalItem $visible={showFiltersList}>
					<SearchContextComponent items={selectableItems} fieldsToFilter={['property', 'module']}>
						<TicketsFiltersSearchInput
							placeholder={formatMessage({
								id: 'viewer.card.tickets.filters.searchInputPlaceholder',
								defaultMessage: 'Search for property...',
							})}
						/>
						<TicketFiltersSelectionList onFilterClick={setSelectedFilter} />
					</SearchContextComponent>
				</TicketsFiltersModalItem>
				<TicketsFiltersModalItem $visible={!showFiltersList}>
					{!showFiltersList && (<TicketsBulkEditForm name={selectedProperty} selectedIds={selectedItems} onCancel={clearFilter}/>)}
				</TicketsFiltersModalItem>
			</TicketsFiltersModal>
		</CardFilterActionMenu>
	);
    
};