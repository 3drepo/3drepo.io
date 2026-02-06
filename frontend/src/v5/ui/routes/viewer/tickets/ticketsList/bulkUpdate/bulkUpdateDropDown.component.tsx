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
import { TicketsFiltersModal, TicketsFiltersModalItem } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFiltersSelection.styles';
import { SearchContextComponent } from '@controls/search/searchContext';
import { SearchInput } from '@controls/search/searchInput';
import { PopoverOrigin, PopoverProps } from '@mui/material';
import { useContext, useState } from 'react';
import { ActionMenuButton } from '../ticketsList.styles';
import { FormattedMessage } from 'react-intl';
import { TicketsBulkEditForm } from '@components/shared/ticketsBulkEdit/ticketsBulkEditForm.component';
import { TicketsBulkUpdateContext } from '@components/tickets/bulkUpdate/bulkUpdate.context';
import { templatesToFilters } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';

export const BulkUpdateDropdown = () => {
	const [selectedFilter, setSelectedFilter] = useState<TicketFilter>(null);
	const showFiltersList = !selectedFilter?.property;
	const { selectedItems } =  useContext(TicketsBulkUpdateContext);
	const templates = TicketsCardHooksSelectors.selectCurrentTemplates();
	
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

	const selectableItems = templatesToFilters(templates);

	// HACK: reconstructing the property name until refactor of properties list is done to just use 
	// the property name instead of filters
	let selectedProperty = '';
	
	if (selectedFilter) {
		selectedProperty = selectedFilter.module ? `modules.${selectedFilter.module}.${selectedFilter.property}` : `properties.${selectedFilter.property}`;

		// in the case of description is not in the properties field

		if (selectedFilter.property === 'description') { 
			selectedProperty = 'description';
		}
	}

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
						<SearchInput
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