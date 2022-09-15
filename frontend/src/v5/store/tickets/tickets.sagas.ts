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
// import * as API from '@/v5/services/api';
import { formatMessage } from '@/v5/services/intl';
import {
	TicketsTypes,
	TicketsActions,
	FetchModelTicketsAction,
	FetchTemplatesAction,
	FetchTemplateDetailsAction,
} from './tickets.redux';
import { fakeTemplates, fakeTemplatesDetails, fakeTickets } from './deleteMeWhenTicketApiWork';
import { DialogsActions } from '../dialogs/dialogs.redux';

// TODO - after endpoints are ready, uncomment comments all over
// TODO - the file (ALSO UNCOMMENT tickets.sagas.spec.ts!!)
// eslint-disable-next-line
export function* fetchModelTickets({ teamspace, projectId, modelId, isFederation }: FetchModelTicketsAction) {
	try {
		// const fetchTickets = isFederation ? API.Tickets.fetchFederationTickets : API.Tickets.fetchContainerTickets;
		// const tickets = yield fetchTickets({ teamspace, projectId, modelId });
		const tickets = fakeTickets;
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

export function* fetchTemplates({ teamspace }: FetchTemplatesAction) {
	try {
		// const templates = yield API.Tickets.fetchTemplates(teamspace);
		const templates = fakeTemplates;
		yield put(TicketsActions.fetchTemplatesSuccess(teamspace, templates));
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

export function* fetchTemplateDetails({ teamspace, templateId }: FetchTemplateDetailsAction) {
	try {
		// const details = yield API.Tickets.fetchTemplateDetails(teamspace, templateId);
		const details = fakeTemplatesDetails[templateId];
		yield put(TicketsActions.fetchTemplateDetailsSuccess(teamspace, templateId, details));
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
	yield takeLatest(TicketsTypes.FETCH_MODEL_TICKETS, fetchModelTickets);
	yield takeLatest(TicketsTypes.FETCH_TEMPLATES, fetchTemplates);
	yield takeLatest(TicketsTypes.FETCH_TEMPLATE_DETAILS, fetchTemplateDetails);
}
