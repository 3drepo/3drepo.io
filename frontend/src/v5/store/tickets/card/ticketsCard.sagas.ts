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

import { put, race, select, take, takeLatest } from 'redux-saga/effects';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { BaseProperties, TicketsCardViews } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { ViewerGuiActions } from '@/v4/modules/viewerGui/viewerGui.redux';
import { FetchTicketsListAction, OpenTicketAction, TicketsCardActions, TicketsCardTypes, UpsertFilterAction } from './ticketsCard.redux';
import { TicketsActions, TicketsTypes } from '../tickets.redux';
import { DialogsActions, DialogsTypes } from '../../dialogs/dialogs.redux';
import { formatMessage } from '@/v5/services/intl';
import { selectTemplates } from '../tickets.selectors';
import { selectCardFilters } from './ticketsCard.selectors';
import * as API from '@/v5/services/api';
import { filtersToQuery } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers';
import { isEqual, pick } from 'lodash';

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
		}, [BaseProperties.DESCRIPTION, BaseProperties.UPDATED_AT]);
		yield put(TicketsActions.fetchTickets(teamspace, projectId, modelId, isFederation, propertiesToInclude));

	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'tickets.fetchTicketsList.error', defaultMessage: 'trying to fetch the tickets list' }),
			error,
		}));
	}
}

export function* fetchFilteredTickets({ teamspace, projectId, modelId, isFederation }: FetchTicketsListAction) {
	try {
		const filters = yield select(selectCardFilters);
		const fetchModelTickets = isFederation
			? API.Tickets.fetchFederationTickets
			: API.Tickets.fetchContainerTickets;
		const tickets = yield fetchModelTickets(teamspace, projectId, modelId, { filters: filtersToQuery(filters) });
		const ticketIds = tickets.map((t) => t._id);
		yield put(TicketsCardActions.setFilteredTicketIds(ticketIds));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'tickets.fetchFilteredTickets.error', defaultMessage: 'trying to fetch the filtered tickets' }),
			error,
		}));
	}
}

export function* upsertFilter({ filter }: UpsertFilterAction) {
	try {
		const filters = yield select(selectCardFilters);
		const getPath = (f) => pick(f, ['module', 'property', 'type']);
		const oldFilter = filters.find((f) => isEqual(getPath(filter), getPath(f)));

		yield put(TicketsCardActions.upsertFilterSuccess(filter));
		const { failure } = yield race({
			success: take(TicketsCardTypes.SET_FILTERED_TICKET_IDS),
			failure: take(DialogsTypes.OPEN),
		});
		if (!failure) return;
		// if editing a filter then revert it, else delete the invalid filter
		yield oldFilter ?
			put(TicketsCardActions.upsertFilter(oldFilter)) :
			put(TicketsCardActions.deleteFilter(filter));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'tickets.upsertFilter.error', defaultMessage: 'trying to upsert a filter' }),
			error,
		}));
	}
}

export default function* ticketsCardSaga() {
	yield takeLatest(TicketsCardTypes.OPEN_TICKET, openTicket);
	yield takeLatest(TicketsCardTypes.FETCH_TICKETS_LIST, fetchTicketsList);
	yield takeLatest(TicketsCardTypes.FETCH_FILTERED_TICKETS, fetchFilteredTickets);
	yield takeLatest(TicketsCardTypes.UPSERT_FILTER, upsertFilter);
}
