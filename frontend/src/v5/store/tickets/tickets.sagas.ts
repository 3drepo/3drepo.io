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

import { put, takeLatest } from 'redux-saga/effects';
import * as API from '@/v5/services/api';
import { formatMessage } from '@/v5/services/intl';
import { TicketsTypes, TicketsActions, FetchModelTicketsAction } from './tickets.redux';
import { fakeTickets } from './deleteMeWhenTicketApiWork';
import { DialogsActions } from '../dialogs/dialogs.redux';
 
export function* fetchModelTickets({
	teamspace,
	projectId,
	modelId,
	isFederation,
}: FetchModelTicketsAction) {
	try {
		// TODO - uncomment after endpoint is  (ALSO FIX TESTS!!)
		const fetchTickets = isFederation ? API.Tickets.fetchFederationTickets : API.Tickets.fetchContainerTickets;
		const tickets = yield fetchTickets({ teamspace, projectId, modelId });
		// const tickets = fakeTickets;
		yield put(TicketsActions.fetchModelTicketsSuccess(modelId, tickets));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage(
				{ id: 'ticekts.fetchTickets.error', defaultMessage: 'trying to fetch {model} tickets' },
				{ model: isFederation ? 'federation' : 'container' },
			),
			error,
		}));
	}
}

export default function* TicketsSagas() {
	yield takeLatest(TicketsTypes.FETCH_MODEL_TICKETS, fetchModelTickets);
}
