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
import { useTicketFiltersContext } from '@components/viewer/cards/cardFilters/ticketsFilters.context';
import { SearchContextComponent } from '@controls/search/searchContext';
import { SearchInput } from '@controls/search/searchInput';
import { PopoverOrigin, PopoverProps } from '@mui/material';
import { useContext, useState } from 'react';
import { ActionMenuButton } from '../ticketsList.styles';
import { FormattedMessage } from 'react-intl';
import { TicketsBulkEditForm } from '@components/shared/ticketsBulkEdit/ticketsBulkEditForm.component';
import { TicketsBulkUpdateContext } from '@components/tickets/bulkUpdate/bulkUpdate.context';

export const BulkUpdateDropdown = () => {
	const [selectedFilter, setSelectedFilter] = useState<TicketFilter>(null);
	const { choosablefilters: unusedFilters, displayMode } = useTicketFiltersContext();
	const showFiltersList = !selectedFilter?.property;
	const { selectedItems } =  useContext(TicketsBulkUpdateContext);
	
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
			$displayMode={displayMode}
		>
			<SearchContextComponent items={unusedFilters} fieldsToFilter={['property', 'module']}>
				<TicketsFiltersModal $visibleIndex={showFiltersList ? 0 : 1}>
					<TicketsFiltersModalItem $visible={showFiltersList}>
						<SearchInput
							placeholder={formatMessage({
								id: 'viewer.card.tickets.filters.searchInputPlaceholder',
								defaultMessage: 'Search for property...',
							})}
						/>
						<TicketFiltersSelectionList onFilterClick={setSelectedFilter} />
					</TicketsFiltersModalItem>
					<TicketsFiltersModalItem $visible={!showFiltersList}>
						{!showFiltersList && (<TicketsBulkEditForm name={selectedFilter.property} selectedIds={selectedItems} onCancel={clearFilter}/>)}
					</TicketsFiltersModalItem>
				</TicketsFiltersModal>
			</SearchContextComponent>
		</CardFilterActionMenu>
	);
    
};