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
import { ReactElement, useState } from 'react';
import { TicketFiltersSelectionList } from './list/ticketFiltersSelectionList.component';
import { SearchInput, TicketsFiltersModal, TicketsFiltersModalItem } from './ticketFiltersSelection.styles';
import { CardFilter } from '../../cardFilters.types';
import { FilterForm } from '../../filterForm/filterForm.component';
import { CardFilterActionMenu } from '../../filterForm/filterForm.styles';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { ITemplate } from '@/v5/store/tickets/tickets.types';

type IFilterSelection = {
	templates: ITemplate[],
	TriggerButton: (props) => ReactElement,
};

export const FilterSelection = ({ templates, TriggerButton }: IFilterSelection) => {
	const [selectedFilter, setSelectedFilter] = useState<CardFilter>(null);
	const unusedFilters = TicketsCardHooksSelectors.selectAvailableTemplatesFilters(templates);
	const showFiltersList = !selectedFilter?.property;
	const disabled = !unusedFilters.length;

	const clearFilter = () => setSelectedFilter(null);

	return (
		<CardFilterActionMenu
			TriggerButton={<TriggerButton disabled={disabled} />}
			onClose={clearFilter}
			disabled={disabled}
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
							onSubmit={TicketsCardActionsDispatchers.upsertFilter}
							onCancel={clearFilter}
						/>
					</TicketsFiltersModalItem>
				</TicketsFiltersModal>
			</SearchContextComponent>
		</CardFilterActionMenu>
	);
};