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
import { useContext, useState } from 'react';
import FennelIcon from '@assets/icons/filters/fennel.svg';
import { Tooltip } from '@mui/material';
import { TicketFiltersSelectionList } from './list/ticketFiltersSelectionList.component';
import { SearchInput, DrillDownList, DrillDownItem } from './ticketFiltersSelection.styles';
import { TicketFilterListItemType } from '../../cardFilters.types';
import { FilterForm } from '../../filterForm/filterForm.component';
import { CardFilterActionMenu } from '../../filterForm/filterForm.styles';
import { TicketFiltersContext } from '@components/viewer/cards/tickets/ticketFiltersContext';

export const FilterSelection = () => {
	const { upsertFilter } = useContext(TicketFiltersContext);
	const [active, setActive] = useState(false);
	const [selectedItem, setSelectedItem] = useState<TicketFilterListItemType>(null);
	const { containerOrFederation } = useParams<ViewerParams>();
	const tickets = TicketsHooksSelectors.selectTicketsRaw(containerOrFederation);
	const usedTemplates = uniq(tickets.map((t) => t.type));
	const templates = usedTemplates.map((t) => selectTemplateById(getState(), containerOrFederation, t));
	const filterElements = templatesToFilters(templates);
	const showFiltersList = !selectedItem?.property;

	const onOpen = () => setActive(true);
	const onClose = () => {
		setActive(false);
		setSelectedItem(null);
	};
	const onCancel = () => setSelectedItem(null);

	return (
		<CardFilterActionMenu
			TriggerButton={(
				<Tooltip title={formatMessage({ id: 'viewer.card.tickets.addFilter', defaultMessage: 'Add Filter' })}>
					<div>
						<CardAction disabled={!filterElements.length} $active={active}>
							<FennelIcon />
						</CardAction>
					</div>
				</Tooltip>
			)}
			onOpen={onOpen}
			onClose={onClose}
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
						<TicketFiltersSelectionList setSelectedFilter={setSelectedItem} />
					</DrillDownItem>
					<DrillDownItem $visible={!showFiltersList}>
						<FilterForm
							{...(selectedItem || {} as any)}
							onSubmit={upsertFilter}
							onCancel={onCancel}
						/>
					</DrillDownItem>
				</DrillDownList>
			</SearchContextComponent>
		</CardFilterActionMenu>
	);
};