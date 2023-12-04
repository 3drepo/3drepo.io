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
import { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { TicketsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsActionsDispatchers, TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { FilterChip } from '@controls/chip/filterChip/filterChip.styles';
import { goToView } from '@/v5/helpers/viewpoint.helpers';
import { VIEWER_EVENTS } from '@/v4/constants/viewer';
import { getTicketIsCompleted } from '@/v5/store/tickets/tickets.helpers';
import { formatMessage } from '@/v5/services/intl';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { FormattedMessage } from 'react-intl';
import TickIcon from '@assets/icons/outlined/tick-outlined.svg';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { SearchContextComponent, SearchContext, SearchContextType } from '@controls/search/searchContext';
import { TicketItem } from './ticketItem/ticketItem.component';
import { List, Filters, CompletedFilterChip, TicketSearchInput } from './ticketsList.styles';
import { ViewerParams } from '../../../routes.constants';
import { AdditionalProperties } from '../tickets.constants';
import { hasDefaultPin } from '../ticketsForm/properties/coordsProperty/coordsProperty.helpers';

type TicketsListProps = {
	tickets: ITicket[];
};

export const TicketsList = ({ tickets }: TicketsListProps) => {
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const [availableTemplates, setAvailableTemplates] = useState([]);
	const [showingCompleted, setShowingCompleted] = useState(false);
	const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
	const [ticketsFilteredByComplete, setTicketsFilteredByComplete] = useState<ITicket[]>([]);
	const templates = TicketsHooksSelectors.selectTemplates(containerOrFederation);
	const selectedTicket = TicketsCardHooksSelectors.selectSelectedTicket();

	const ticketIsSelected = (ticket: ITicket) => selectedTicket?._id === ticket._id;

	const toggleTemplate = (templateId: string) => {
		if (selectedTemplates.has(templateId)) {
			selectedTemplates.delete(templateId);
		} else {
			selectedTemplates.add(templateId);
		}
		setSelectedTemplates(new Set(selectedTemplates));
	};

	const filterByTemplates = (items) => {
		if (!selectedTemplates.size) return items;
		return items.filter((ticket) => selectedTemplates.has(ticket.type));
	};

	const filterTicketByCompletedStatus = (ticket) => getTicketIsCompleted(ticket) === showingCompleted;

	useEffect(() => {
		const itemsFilteredByComplete = tickets.filter(filterTicketByCompletedStatus);
		setTicketsFilteredByComplete(itemsFilteredByComplete);

		const reducedTemplates = templates.reduce((partial, { _id, ...other }) => {
			const itemsFilteredByTemplate = tickets.filter((ticket) => _id === ticket.type);
			if (!itemsFilteredByTemplate.length) return partial;
			const { length } = itemsFilteredByTemplate.filter(filterTicketByCompletedStatus);
			return [...partial, { _id, length, ...other }];
		}, []);
		setAvailableTemplates(reducedTemplates);
	}, [tickets, templates, showingCompleted]);

	const onTicketClick = (ticket: ITicket, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.stopPropagation();

		const wasSelected = ticketIsSelected(ticket);

		TicketsCardActionsDispatchers.setSelectedTicket(ticket._id);
		TicketsCardActionsDispatchers.setSelectedTicketPin(hasDefaultPin(ticket) ? ticket._id : null);

		if (wasSelected) {
			TicketsCardActionsDispatchers.openTicket(ticket._id);
		}

		TicketsActionsDispatchers.fetchTicketGroups(teamspace, project, containerOrFederation, ticket._id);
	};

	useEffect(() => {
		const view = selectedTicket?.properties?.[AdditionalProperties.DEFAULT_VIEW];
		if (isEmpty(view)) return;
		goToView(view);
	}, [selectedTicket?.properties?.[AdditionalProperties.DEFAULT_VIEW]?.state]);

	useEffect(() => {
		TicketsCardActionsDispatchers.setSelectedTicketPin(selectedTicket?._id);

		const unselectTicket = () => TicketsCardActionsDispatchers.setSelectedTicket(null);
		ViewerService.on(VIEWER_EVENTS.BACKGROUND_SELECTED, unselectTicket);
		return () => ViewerService.off(VIEWER_EVENTS.BACKGROUND_SELECTED, unselectTicket);
	}, []);

	const filterItems = (items, query: string) => {
		const queries = query ? JSON.parse(query) : [];
		if (!queries.length) return items;
		return items.filter((ticket) => {
			const templateCode = availableTemplates.find((template) => template._id === ticket.type).code;
			const ticketCode = `${templateCode}:${ticket.number}`;
			return queries.some((q) => [ticketCode, ticket.title].some((str) => str.toLowerCase().includes(q.toLowerCase())));
		});
	};

	return (
		<SearchContextComponent filteringFunction={filterItems} items={ticketsFilteredByComplete}>
			<TicketSearchInput />
			<SearchContext.Consumer>
				{({ filteredItems }: SearchContextType<ITicket>) => (
					<>
						<Filters>
							<CompletedFilterChip
								key="completed"
								selected={showingCompleted}
								icon={<TickIcon />}
								onClick={() => setShowingCompleted((prev) => !prev)}
								label={formatMessage({ id: 'ticketsList.filters.completed', defaultMessage: 'Completed' })}
							/>
							{availableTemplates.map(({ name, _id }) => {
								const count = filteredItems.filter(({ type }) => type === _id).length;
								return (
									<FilterChip
										key={_id}
										selected={selectedTemplates.has(_id)}
										onClick={() => toggleTemplate(_id)}
										label={`${name} (${count})`}
									/>
								);
							})}
						</Filters>
						{filterByTemplates(filteredItems).length ? (
							<List>
								{filterByTemplates(filteredItems).map((ticket) => (
									<TicketItem
										ticket={ticket}
										key={ticket._id}
										onClick={(e) => onTicketClick(ticket, e)}
										selected={ticketIsSelected(ticket)}
									/>
								))}
							</List>
						) : (
							<EmptyListMessage>
								<FormattedMessage id="viewer.cards.tickets.noResults" defaultMessage="No tickets found. Please try another search." />
							</EmptyListMessage>
						)}
					</>
				)}
			</SearchContext.Consumer>
		</SearchContextComponent>
	);
};
