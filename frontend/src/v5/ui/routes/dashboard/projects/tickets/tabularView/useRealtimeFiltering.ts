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
import {
	enableRealtimeWatchPropertiesNewTicket,
	enableRealtimeWatchPropertiesUpdateTicket,
	UPDATE_TICKETS_BATCH_INTERVAL,
	UPDATE_TICKETS_BATCH_SIZE,
} from '@/v5/services/realtime/ticketTable.events';
import { FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { apiFetchFilteredTickets } from '@/v5/store/tickets/card/ticketsCard.sagas';
import { selectTicketByIdRaw } from '@/v5/store/tickets/tickets.selectors';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { TicketFilter } from '@components/viewer/cards/cardFilters/cardFilters.types';
import { getTicketFilterFromCodes, getTemplateFilter } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers';
import { debounce } from 'lodash';
import { useEffect, useRef } from 'react';


const toTicketPath = (filter:TicketFilter) => {
	if (filter.type === 'title') return filter.type;
	if (!filter.module) return 'properties.' + filter.property;
	return 'modules.' + filter.module + '.' + filter.property;
};

export const useRealtimeFiltering = (
	teamspace, project, containersAndFederations, template, 
	filters: TicketFilter[], 
	callback: (ticketId:string, included: boolean) => void,
) => {
	const isFed = FederationsHooksSelectors.selectIsFederation();
	const callbackRef = useRef(callback);
	const templateCode = template?.code;
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		const properties = filters?.map(toTicketPath);
		let active = true;
		const subscriptions = containersAndFederations.map((modelId) => {
			const isFederation = isFed(modelId);
			let queuedTickets: string[] = [];
			const debouncedApplyFilters = debounce(async () => {
				if (!queuedTickets.length) return;

				const ticketIds = queuedTickets;
				queuedTickets = [];
				const ticketCodes = ticketIds.map((ticketId) => {
					const { number } = selectTicketByIdRaw(getState(), modelId, ticketId);
					return templateCode + ':' + number;
				});
				const allFilters = [...filters, getTicketFilterFromCodes(ticketCodes), getTemplateFilter(templateCode)];
				const res = await apiFetchFilteredTickets(teamspace, project, modelId, isFederation, allFilters);
				if (active) ticketIds.forEach((ticketId) => callbackRef.current(ticketId, res.has(ticketId)));
			}, UPDATE_TICKETS_BATCH_INTERVAL);

			const onNewOrUpdate = (t, p, m, f, ticket: Partial<ITicket>) => {
				queuedTickets.push(ticket._id);
				debouncedApplyFilters();
				if (queuedTickets.length >= UPDATE_TICKETS_BATCH_SIZE) {
					debouncedApplyFilters.flush();
				}
			};

			return combineSubscriptions(
				enableRealtimeWatchPropertiesUpdateTicket(teamspace, project, modelId, isFederation, properties, onNewOrUpdate),
				enableRealtimeWatchPropertiesNewTicket(teamspace, project, modelId, isFederation, onNewOrUpdate),
				() => debouncedApplyFilters.cancel(),
			);
		});
		return () => {
			active = false;
			combineSubscriptions(...subscriptions)();
		};
	}, [teamspace, project, containersAndFederations, isFed, templateCode, filters]);
};