/**
 *  Copyright (C) 2025 3D Repo Ltd
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
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import { enableRealtimeWatchPropertiesNewTicket, enableRealtimeWatchPropertiesUpdateTicket } from '@/v5/services/realtime/ticketTable.events';
import { FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { apiFetchFilteredTickets } from '@/v5/store/tickets/card/ticketsCard.sagas';
import { selectTicketByIdRaw } from '@/v5/store/tickets/tickets.selectors';
import { TicketFilter } from '@components/viewer/cards/cardFilters/cardFilters.types';
import { getTicketFilterFromCodes, getTemplateFilter } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers';
import { useEffect } from 'react';


const toTicketPath = (filter:TicketFilter) => {
	if (filter.type === 'title') return filter.type;
	return (filter.module ? 'module.' : '') + 'properties.' + filter.property;
};

export const useRealtimeFiltering = (
	teamspace, project, containersAndFederations, template, 
	filters: TicketFilter[], 
	callback: (ticketId:string, included: boolean) => void,
) => {
	const isFed = FederationsHooksSelectors.selectIsFederation();
	const properties = filters?.map(toTicketPath);

	const onNewORUpdate = async (t, p, m, f, ticket) => {
		const { number, _id: ticketId } =  selectTicketByIdRaw(getState(), m, ticket._id);
		const templateCode = template.code;
		const ticketCode = templateCode + ':' + number;
		const allFilters = [...filters, getTicketFilterFromCodes([ticketCode]), getTemplateFilter(templateCode)];
		const res = await apiFetchFilteredTickets(t, p, m, f, allFilters);
		callback(ticketId, res.has(ticketId));
	};

	useEffect(() => {
		const subscriptions = containersAndFederations.map((modelId) => 
			enableRealtimeWatchPropertiesUpdateTicket(teamspace, project, modelId, isFed(modelId), properties, onNewORUpdate),
		);
		return combineSubscriptions(...subscriptions);
	}, [teamspace, project, containersAndFederations, isFed, properties, onNewORUpdate]);

	useEffect(() => {
		const subscriptions = containersAndFederations.map((modelId) => 
			enableRealtimeWatchPropertiesNewTicket(teamspace, project, modelId, isFed(modelId), onNewORUpdate),
		);
		return combineSubscriptions(...subscriptions);
	}, [teamspace, project, containersAndFederations, isFed, properties, onNewORUpdate]);
};