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

import { put, takeLatest, takeEvery } from 'redux-saga/effects';
import * as API from '@/v5/services/api';
import { formatMessage } from '@/v5/services/intl';
import {
	TicketsTypes,
	TicketsActions,
	FetchTicketsAction,
	FetchTemplatesAction,
	FetchTemplateDetailsAction,
} from './tickets.redux';
// import { fakeTemplates, fakeTemplatesDetails, fakeTickets } from './deleteMeWhenTicketApiWork';
import { DialogsActions } from '../dialogs/dialogs.redux';

// TODO - after endpoints are ready, uncomment comments all over
// TODO - the file (ALSO UNCOMMENT tickets.sagas.spec.ts!!)
// eslint-disable-next-line
export function* fetchTickets({ teamspace, projectId, modelId, isFederation }: FetchTicketsAction) {
	try {
		const fetchModelTickets = isFederation ? API.Tickets.fetchFederationTickets : API.Tickets.fetchContainerTickets;
		const tickets = yield fetchModelTickets({ teamspace, projectId, modelId });
		// const tickets = fakeTickets;
		yield put(TicketsActions.fetchTicketsSuccess(modelId, tickets));
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

export function* fetchTemplates({ teamspace, projectId, modelId, isFederation }: FetchTemplatesAction) {
	try {
		const fetchModelTemplates = isFederation ? API.Tickets.fetchFederationTemplates : API.Tickets.fetchContainerTemplates;
		const templates = yield fetchModelTemplates({ teamspace, projectId, modelId });
		// const templates = fakeTemplates;
		yield put(TicketsActions.fetchTemplatesSuccess(modelId, templates));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({
				id: 'tickets.fetchTemplates.error.action',
				defaultMessage: 'trying to fetch templates',
			}),
			error,
			details: formatMessage({
				id: 'tickets.fetchTemplates.error.details',
				defaultMessage: 'If reloading the page doesn\'t work please contact support',
			}),
		}));
	}
}

export function* fetchTemplateDetails({ teamspace, projectId, modelId, templateId, isFederation }: FetchTemplateDetailsAction) {
	try {
		const fetchModelTemplateDetails = isFederation ? API.Tickets.fetchFederationTemplateDetails : API.Tickets.fetchContainerTemplateDetails;
		const details = yield fetchModelTemplateDetails({ teamspace, projectId, modelId, templateId });
		// const details = fakeTemplatesDetails[templateId];
		yield put(TicketsActions.fetchTemplateDetailsSuccess(modelId, templateId, details));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({
				id: 'tickets.fetchTtemplateDetails.error.action',
				defaultMessage: 'trying to fetch template details',
			}),
			error,
			details: formatMessage({
				id: 'tickets.fetchTtemplateDetails.error.details',
				defaultMessage: 'If reloading the page doesn\'t work please contact support',
			}),
		}));
	}
}

export default function* TicketsSagas() {
	yield takeLatest(TicketsTypes.FETCH_TICKETS, fetchTickets);
	yield takeLatest(TicketsTypes.FETCH_TEMPLATES, fetchTemplates);
	yield takeEvery(TicketsTypes.FETCH_TEMPLATE_DETAILS, fetchTemplateDetails);
}
