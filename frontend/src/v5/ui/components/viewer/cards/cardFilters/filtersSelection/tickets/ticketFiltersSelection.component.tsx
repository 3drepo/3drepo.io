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

import { formatMessage } from '@/v5/services/intl';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { SearchContextComponent } from '@controls/search/searchContext';
import { CardAction } from '../../../cardAction/cardAction.styles';
import { useState } from 'react';
import FunnelIcon from '@assets/icons/filters/funnel.svg';
import { Tooltip } from '@mui/material';
import { TicketFiltersSelectionList } from './list/ticketFiltersSelectionList.component';
import { SearchInput, DrillDownList, DrillDownItem } from './ticketFiltersSelection.styles';
import { TicketCardFilterDescription } from '../../cardFilters.types';
import { FilterForm } from '../../filterForm/filterForm.component';
import { CardFilterActionMenu } from '../../filterForm/filterForm.styles';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';

export const FilterSelection = () => {
	const [open, setOpen] = useState(false);
	const [selectedFilter, setSelectedFilter] = useState<TicketCardFilterDescription>(null);
	const tickets = TicketsCardHooksSelectors.selectCurrentTickets();
	const unusedFilters = TicketsCardHooksSelectors.selectAvailableTemplatesFilters();
	const showFiltersList = !selectedFilter?.property;
	const disabled = !unusedFilters.length || !tickets.length;

	const onOpen = () => setOpen(true);
	const onClose = () => {
		setOpen(false);
		setSelectedFilter(null);
	};
	const onCancel = () => setSelectedFilter(null);

	return (
		<CardFilterActionMenu
			TriggerButton={(
				<Tooltip title={formatMessage({ id: 'viewer.card.tickets.addFilter', defaultMessage: 'Add Filter' })}>
					<div>
						<CardAction disabled={disabled} selected={open}>
							<FunnelIcon />
						</CardAction>
					</div>
				</Tooltip>
			)}
			onOpen={onOpen}
			onClose={onClose}
			disabled={disabled}
		>
			<SearchContextComponent items={unusedFilters}>
				<DrillDownList $visibleIndex={showFiltersList ? 0 : 1}>
					<DrillDownItem $visible={showFiltersList}>
						<SearchInput
							placeholder={formatMessage({
								id: 'viewer.card.tickets.filters.searchInputPlaceholder',
								defaultMessage: 'Serach for property...',
							})}
						/>
						<TicketFiltersSelectionList onFilterClick={setSelectedFilter} />
					</DrillDownItem>
					<DrillDownItem $visible={!showFiltersList}>
						<FilterForm
							{...(selectedFilter || {} as any)}
							onSubmit={TicketsCardActionsDispatchers.upsertFilter}
							onCancel={onCancel}
						/>
					</DrillDownItem>
				</DrillDownList>
			</SearchContextComponent>
		</CardFilterActionMenu>
	);
};