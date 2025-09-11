/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { AdditionalProperties, BaseProperties, TicketsCardViews } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { ViewerGuiActions } from '@/v4/modules/viewerGui/viewerGui.redux';
import { ApplyFilterForTicketAction, FetchTicketsListAction, OpenTicketAction, TicketsCardActions, TicketsCardTypes } from './ticketsCard.redux';
import { TicketsActions, TicketsTypes } from '../tickets.redux';
import { DialogsActions } from '../../dialogs/dialogs.redux';
import { formatMessage } from '@/v5/services/intl';
import { selectTemplateById, selectTemplates, selectTicketByIdRaw } from '../tickets.selectors';
import { selectCardFilters, selectFilteredTicketIds } from './ticketsCard.selectors';
import * as API from '@/v5/services/api';
import { filtersToQuery } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers';
import { enableMapSet } from 'immer';


enableMapSet();

export function* openTicket({ ticketId }: OpenTicketAction) {
	yield put(TicketsCardActions.setSelectedTicket(ticketId));
	yield put(TicketsCardActions.setCardView(TicketsCardViews.Details));
	yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.TICKETS, true));
}

export function* fetchTicketsList({ teamspace, projectId, modelId, isFederation }: FetchTicketsListAction) {
	try {
		yield put(TicketsActions.fetchTemplates(teamspace, projectId, modelId, isFederation, true));
		yield take(TicketsTypes.FETCH_TEMPLATES_SUCCESS);
		const templates = yield select(selectTemplates, modelId);
		const propertiesToInclude = templates.reduce((acc, template) => {
			const configColor = template.config?.pin?.color;
			if (!configColor?.property) return acc;
			const { property: { module, name } } = configColor;
			const path = module ? `${module}.${name}` : name;
			return [...acc, path];
		}, [BaseProperties.DESCRIPTION, BaseProperties.UPDATED_AT, AdditionalProperties.DEFAULT_IMAGE]);
		yield put(TicketsActions.fetchTickets(teamspace, projectId, modelId, isFederation, propertiesToInclude));

	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'tickets.fetchTicketsList.error', defaultMessage: 'trying to fetch the tickets list' }),
			error,
		}));
	}
}

export const apiFetchFilteredTickets = async (teamspace, projectId, modelId, isFederation, filters ): Promise<Set<string>> => {
	const fetchModelTickets = isFederation
		? API.Tickets.fetchFederationTickets
		: API.Tickets.fetchContainerTickets;
	const tickets = await fetchModelTickets(teamspace, projectId, modelId, { filters: filtersToQuery(filters) });
	return new Set(tickets.map((t) => t._id));
};

export function* fetchFilteredTickets({ teamspace, projectId, modelId, isFederation }: FetchTicketsListAction) {
	try {
		yield put(TicketsCardActions.setFiltering(true));

		const filters = yield select(selectCardFilters);
		const ticketIds = yield apiFetchFilteredTickets(teamspace, projectId, modelId, isFederation, filters);

		yield put(TicketsCardActions.setFilteredTicketIds(ticketIds));
		yield put(TicketsCardActions.setFiltering(false));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'tickets.fetchFilteredTickets.error', defaultMessage: 'trying to fetch the filtered tickets' }),
			error,
		}));
	}
}

export function* applyFilterForTicket({ teamspace, projectId, modelId, isFederation, ticketId }: ApplyFilterForTicketAction) {
	let ticket =  yield select(selectTicketByIdRaw, modelId, ticketId);

	while (!ticket) { // If new ticket message wasnt attended yet wait until the ticket gets defined
		yield take(TicketsTypes.UPSERT_TICKET_SUCCESS);
		ticket =  yield select(selectTicketByIdRaw, modelId, ticketId);
	}
	
	const { number, type } = ticket;
	const { code } = yield select(selectTemplateById, modelId, type);
	const ticketCode = code + ':' + number;
	
	const filters = [...yield select(selectCardFilters)];
	filters.push({
		module: '',
		property: 'Ticket ID',
		type: 'ticketCode',
		filter: {
			operator: 'is',
			values: [ticketCode],
		},
	});

	const ticketWasIncluded = (yield apiFetchFilteredTickets(teamspace, projectId, modelId, isFederation, filters)).size > 0;
	const ticketIds: Set<string> = new Set(yield select(selectFilteredTicketIds));

	if (ticketWasIncluded) ticketIds.add(ticketId);
	else ticketIds.delete(ticketId);
	yield put(TicketsCardActions.setFilteredTicketIds(ticketIds));
}


export default function* ticketsCardSaga() {
	yield takeLatest(TicketsCardTypes.OPEN_TICKET, openTicket);
	yield takeLatest(TicketsCardTypes.FETCH_TICKETS_LIST, fetchTicketsList);
	yield takeLatest(TicketsCardTypes.FETCH_FILTERED_TICKETS, fetchFilteredTickets);
	yield takeEvery(TicketsCardTypes.APPLY_FILTER_FOR_TICKET, applyFilterForTicket);
}
