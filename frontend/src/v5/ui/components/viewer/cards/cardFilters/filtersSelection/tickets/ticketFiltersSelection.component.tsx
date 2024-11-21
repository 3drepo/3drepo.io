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

import { getState } from '@/v5/helpers/redux.helpers';
import { formatMessage } from '@/v5/services/intl';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { selectTemplateById } from '@/v5/store/tickets/tickets.selectors';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { SearchContextComponent } from '@controls/search/searchContext';
import { uniq } from 'lodash';
import { useParams } from 'react-router';
import { templatesToFilters } from './list/ticketFiltersSelectionList.helpers';
import { CardAction } from '../../../cardAction/cardAction.styles';
import { useState } from 'react';
import FennelIcon from '@assets/icons/filters/fennel.svg';
import { Tooltip } from '@mui/material';
import { TicketFiltersSelectionList } from './list/ticketFiltersSelectionList.component';
import { ActionMenu, SearchInput, DrillDownList, DrillDownItem } from './ticketFiltersSelection.styles';
import { FilterListItemType } from '../../cardFilters.types';

export const FilterSelection = () => {
	const [active, setActive] = useState(false);
	const [selectedFilter, setSelectedFilter] = useState<FilterListItemType>(null);
	const { containerOrFederation } = useParams<ViewerParams>();
	const tickets = TicketsHooksSelectors.selectTicketsRaw(containerOrFederation);
	const usedTemplates = uniq(tickets.map((t) => t.type));
	const templates = usedTemplates.map((t) => selectTemplateById(getState(), containerOrFederation, t));
	const filterElements = templatesToFilters(templates);
	const showFiltersList = !selectedFilter?.property;

	return (
		<ActionMenu
			TriggerButton={(
				<Tooltip title={formatMessage({ id: 'viewer.card.tickets.addFilter', defaultMessage: 'Add Filter' })}>
					<div>
						<CardAction disabled={!filterElements.length} active={active}>
							<FennelIcon />
						</CardAction>
					</div>
				</Tooltip>
			)}
			onOpen={() => setActive(true)}
			onClose={() => setActive(false)}
		>
			<SearchContextComponent items={filterElements}>
				<DrillDownList $visibleIndex={showFiltersList ? 0 : 1}>
					<DrillDownItem $visible={showFiltersList}>
						<SearchInput
							placeholder={formatMessage({
								id: 'viewer.card.tickets.filters.searchInputPlaceholder',
								defaultMessage: 'Serach for property...',
							})}
						/>
						<TicketFiltersSelectionList setSelectedFilter={setSelectedFilter} />
					</DrillDownItem>
					<DrillDownItem $visible={!showFiltersList}>
						<div style={{ height: '100px', padding: 20 }}>
							{selectedFilter?.module && <>{selectedFilter?.module}&nbsp;:&nbsp;</>}{selectedFilter?.property}
							<br />
							type: {selectedFilter?.type}
							<br />
							<button onClick={() => setSelectedFilter(null)}>back</button>
							<button onClick={() => setSelectedFilter(null)}>apply</button>
						</div>
					</DrillDownItem>
				</DrillDownList>
			</SearchContextComponent>
		</ActionMenu>
	);
};