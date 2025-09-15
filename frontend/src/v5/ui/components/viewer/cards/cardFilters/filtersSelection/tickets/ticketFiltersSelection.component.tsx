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
import { SearchContextComponent } from '@controls/search/searchContext';
import { useState } from 'react';

import { TicketFiltersSelectionList } from './list/ticketFiltersSelectionList.component';
import { SearchInput, TicketsFiltersModal, TicketsFiltersModalItem } from './ticketFiltersSelection.styles';
import { TicketFilter } from '../../cardFilters.types';
import { FilterForm } from '../../filterForm/filterForm.component';
import { CardFilterActionMenu } from '../../filterForm/filterForm.styles';
import { useTicketFiltersContext } from '../../ticketsFilters.context';
import { PopoverOrigin, PopoverProps, Tooltip } from '@mui/material';
import { CardAction } from '@components/viewer/cards/cardAction/cardAction.styles';
import FunnelIcon from '@assets/icons/filters/funnel.svg';
import { Button } from '@controls/button/button.component';
import { FormattedMessage } from 'react-intl';

const SmallTriggerButton = ({ disabled }) =>
	(<Tooltip title={disabled ? '' : formatMessage({ id: 'viewer.card.tickets.addFilter', defaultMessage: 'Add Filter' })}>
		<CardAction disabled={disabled}>
			<FunnelIcon />
		</CardAction>
	</Tooltip>
	);

const FullTriggerButton = ({ disabled }) => (
	<Button
		startIcon={<FunnelIcon />}
		variant="outlined"
		color="secondary"
		disabled={disabled}
	>
		<FormattedMessage id="filterSelection.AddFilter" defaultMessage="Add filter" />
	</Button>

);



type FilterSelectionMode = 'card' | 'other';


export const FilterSelection = (props: { mode?: FilterSelectionMode }) => {
	const [selectedFilter, setSelectedFilter] = useState<TicketFilter>(null);
	const { choosablefilters: unusedFilters, setFilter } = useTicketFiltersContext();
	const showFiltersList = !selectedFilter?.property;
	const disabled = !unusedFilters.length;

	const clearFilter = () => setSelectedFilter(null);
	
	const anchorOrigin: PopoverOrigin = {
		vertical: 'bottom',
		horizontal: 'right',
	};
			
	const transformOrigin: PopoverOrigin = {
		vertical: 'top',
		horizontal: 'right',
	};
			
	const popoverProps: Partial<PopoverProps> = { anchorOrigin, transformOrigin };
	const TriggerButton = props.mode === 'card' ? SmallTriggerButton : FullTriggerButton;

	return (
		<CardFilterActionMenu
			TriggerButton={<TriggerButton disabled={disabled} />}
			onClose={clearFilter}
			disabled={disabled}
			PopoverProps={popoverProps}
			mode={props.mode}
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
						<FilterForm
							{...(selectedFilter || {} as any)}
							onSubmit={setFilter}
							onCancel={clearFilter}
						/>
					</TicketsFiltersModalItem>
				</TicketsFiltersModal>
			</SearchContextComponent>
		</CardFilterActionMenu>
	);
};