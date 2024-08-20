/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { uniq, xor } from 'lodash';
import { TicketsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { FilterChip } from '@controls/chip/filterChip/filterChip.styles';
import { VIEWER_EVENTS } from '@/v4/constants/viewer';
import { formatMessage } from '@/v5/services/intl';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { FormattedMessage } from 'react-intl';
import TickIcon from '@assets/icons/outlined/tick-outlined.svg';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { TicketItem } from './ticketItem/ticketItem.component';
import { Filters, CompletedFilterChip, List } from './ticketsList.styles';
import { ViewerParams } from '../../../routes.constants';
import { AutocompleteSearchInput } from '@controls/search/autocompleteSearchInput/autocompleteSearchInput.component';

type TicketsListProps = {
	tickets: ITicket[];
};

export const TicketsList = ({ tickets }: TicketsListProps) => {
	const { containerOrFederation } = useParams<ViewerParams>();
	const templates = TicketsHooksSelectors.selectTemplates(containerOrFederation);
	const selectedTicket = TicketsCardHooksSelectors.selectSelectedTicket();
	const selectedTemplates = TicketsCardHooksSelectors.selectFilteringTemplates();
	const showingCompleted = TicketsCardHooksSelectors.selectFilteringCompleted();
	const availableTemplatesIds = uniq(tickets.map(({ type }) => type));
	const availableTemplates = templates.filter(({ _id }) => availableTemplatesIds.includes(_id));
	const queries = TicketsCardHooksSelectors.selectFilteringQueries();
	const selectedPinId = TicketsCardHooksSelectors.selectSelectedTicketPinId();
	const isShowingPins = TicketsCardHooksSelectors.selectIsShowingPins();

	const filteredByQueriesAndCompleted = TicketsCardHooksSelectors.selectTicketsFilteredByQueriesAndCompleted();
	const filteredItems = TicketsCardHooksSelectors.selectTicketsWithAllFiltersApplied();

	const toggleTemplate = (templateId: string) => TicketsCardActionsDispatchers.setTemplateFilters(xor(selectedTemplates, [templateId]));
	const onQueriesChange = (newQueries) => TicketsCardActionsDispatchers.setQueryFilters(newQueries);

	useEffect(() => {
		if (!selectedPinId) return;
		ViewerService.setSelectionPin({ id: selectedPinId, isSelected: isShowingPins });
	}, [selectedPinId, isShowingPins]);

	useEffect(() => {
		TicketsCardActionsDispatchers.setSelectedTicketPin(selectedTicket?._id);

		const unselectTicket = () => TicketsCardActionsDispatchers.setSelectedTicket(null);
		ViewerService.on(VIEWER_EVENTS.BACKGROUND_SELECTED, unselectTicket);
		return () => ViewerService.off(VIEWER_EVENTS.BACKGROUND_SELECTED, unselectTicket);
	}, []);

	return (
		<>
			<AutocompleteSearchInput value={queries} onChange={onQueriesChange} />
			<Filters>
				<CompletedFilterChip
					key="completed"
					selected={showingCompleted}
					icon={<TickIcon />}
					onClick={() => TicketsCardActionsDispatchers.toggleCompleteFilter()}
					label={formatMessage({ id: 'ticketsList.filters.completed', defaultMessage: 'Completed' })}
				/>
				{availableTemplates.map(({ name, _id }) => {
					const count = filteredByQueriesAndCompleted.filter(({ type }) => type === _id).length;
					return (
						<FilterChip
							key={_id}
							selected={selectedTemplates.includes(_id)}
							onClick={() => toggleTemplate(_id)}
							label={`${name} (${count})`}
						/>
					);
				})}
			</Filters>
			{filteredItems.length ? (
				<List>
					{filteredItems.map((ticket) => <TicketItem ticket={ticket} key={ticket._id} />)}
				</List>
			) : (
				<EmptyListMessage>
					<FormattedMessage id="viewer.cards.tickets.noResults" defaultMessage="No tickets found. Please try another search." />
				</EmptyListMessage>
			)}
		</>
	);
};
