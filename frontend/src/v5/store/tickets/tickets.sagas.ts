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

import { all, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import * as API from '@/v5/services/api';
import { formatMessage } from '@/v5/services/intl';
import { SnackbarActions } from '@/v4/modules/snackbar';
import { get, isString } from 'lodash';
import {
	TicketsTypes,
	TicketsActions,
	FetchTicketsAction,
	FetchTemplatesAction,
	FetchTicketAction,
	UpdateTicketAction,
	CreateTicketAction,
	FetchTemplateAction,
	FetchRiskCategoriesAction,
	FetchTicketGroupsAction,
	UpsertTicketAndFetchGroupsAction,
	UpdateTicketGroupAction,
	FetchTicketPropertiesAction,
	FetchTicketGroupsAndGoToView,
} from './tickets.redux';
import { DialogsActions } from '../dialogs/dialogs.redux';
import { getContainerOrFederationFormattedText, RELOAD_PAGE_OR_CONTACT_SUPPORT_ERROR_MESSAGE } from '../store.helpers';
import { ITicket, ViewpointState } from './tickets.types';
import { selectTicketById, selectTicketByIdRaw, selectTicketsGroups } from './tickets.selectors';
import { selectContainersByFederationId } from '../federations/federations.selectors';
import { getSanitizedSmartGroup } from './ticketsGroups.helpers';
import { addUpdatedAtTime } from './tickets.helpers';
import { filtersToQuery } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers';
import { AsyncFunctionExecutor, ExecutionStrategy } from '@/v5/helpers/functions.helpers';
import { AdditionalProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { goToView } from '@/v5/helpers/viewpoint.helpers';

export function* fetchTickets({ teamspace, projectId, modelId, isFederation, propertiesToInclude }: FetchTicketsAction) {
	try {
		const fetchModelTickets = isFederation
			? API.Tickets.fetchFederationTickets
			: API.Tickets.fetchContainerTickets;
		const tickets = yield fetchModelTickets(teamspace, projectId, modelId, { propertiesToInclude });
		yield put(TicketsActions.fetchTicketsSuccess(modelId, tickets));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage(
				{ id: 'tickets.fetchTickets.error', defaultMessage: 'trying to fetch {model} tickets' },
				{ model: getContainerOrFederationFormattedText(isFederation) },
			),
			error,
		}));
	}
}

const ticketPropertiesQueue = new AsyncFunctionExecutor(
	(isFederation, teamspace, projectId, modelId, queryParams) => (
		isFederation
			? API.Tickets.fetchFederationTickets
			: API.Tickets.fetchContainerTickets
	)(teamspace, projectId, modelId, queryParams),
	40,
	ExecutionStrategy.Fifo,
);


export function* fetchTicketProperties({
	teamspace, projectId, modelId, ticketId,
	templateCode, isFederation, propertiesToInclude,
}: FetchTicketPropertiesAction) {
	try {
		yield put(TicketsActions.addFetchingTicketProperties(ticketId, propertiesToInclude));
		const { number } = yield select(selectTicketById, modelId, ticketId);
		const filterByTemplateCode = {
			filter: {
				operator: 'is',
				values: [`${templateCode}:${number}`],
			},
			property: 'Ticket ID',
			type: 'ticketCode',
		} as any;
		const [ticket] = yield ticketPropertiesQueue.addCall(
			isFederation,
			teamspace,
			projectId,
			modelId,
			{ propertiesToInclude, filters: filtersToQuery([filterByTemplateCode]) },
		);
		yield put(TicketsActions.removeFetchingTicketProperties(ticketId, propertiesToInclude));
		yield put(TicketsActions.upsertTicketSuccess(modelId, { ...ticket, _id: ticketId }));

	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage(
				{ id: 'tickets.fetchTicketProperties.error', defaultMessage: 'trying to fetch {model} ticket properties' },
				{ model: getContainerOrFederationFormattedText(isFederation) },
			),
			error,
		}));
	}
}

export function* fetchTicket({ teamspace, projectId, modelId, ticketId, isFederation, revision }: FetchTicketAction) {
	try {
		const fetchModelTicket = isFederation
			? API.Tickets.fetchFederationTicket
			: API.Tickets.fetchContainerTicket;
		const ticket = yield fetchModelTicket(teamspace, projectId, modelId, ticketId);
		yield put(TicketsActions.upsertTicketSuccess(modelId, ticket));
		yield put(TicketsActions.fetchTicketGroups(teamspace, projectId, modelId, ticketId, revision));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage(
				{ id: 'tickets.fetchTicket.error', defaultMessage: 'trying to fetch the ticket details for {model}' },
				{ model: getContainerOrFederationFormattedText(isFederation) },
			),
			error,
		}));
	}
}

export function* fetchTemplate({ teamspace, projectId, modelId, templateId, isFederation }: FetchTemplateAction) {
	try {
		const fetchTicketsTemplate = isFederation
			? API.Tickets.fetchFederationTemplate
			: API.Tickets.fetchContainerTemplate;
		const template = yield fetchTicketsTemplate(teamspace, projectId, modelId, templateId);
		yield put(TicketsActions.replaceTemplateSuccess(modelId, template));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({
				id: 'tickets.fetchTemplate.error.action',
				defaultMessage: 'trying to fetch a template',
			}),
			error,
			details: RELOAD_PAGE_OR_CONTACT_SUPPORT_ERROR_MESSAGE,
		}));
	}
}

export function* fetchTemplates({ teamspace, projectId, modelId, isFederation, getDetails = false }: FetchTemplatesAction) {
	try {
		const fetchModelTemplates = isFederation
			? API.Tickets.fetchFederationTemplates
			: API.Tickets.fetchContainerTemplates;
		const templates = yield fetchModelTemplates(teamspace, projectId, modelId, getDetails, true);

		yield put(TicketsActions.fetchTemplatesSuccess(modelId, templates));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({
				id: 'tickets.fetchTemplates.error.action',
				defaultMessage: 'trying to fetch templates',
			}),
			error,
			details: RELOAD_PAGE_OR_CONTACT_SUPPORT_ERROR_MESSAGE,
		}));
	}
}

export function* fetchRiskCategories({ teamspace }: FetchRiskCategoriesAction) {
	try {
		const { riskCategories } = yield API.Tickets.fetchRiskCategories(teamspace);
		yield put(TicketsActions.fetchRiskCategoriesSuccess(riskCategories));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({
				id: 'tickets.fetchRiskCategories.error.action',
				defaultMessage: 'trying to fetch the risk categories',
			}),
			error,
		}));
	}
}

export function* updateTicketGroup({ teamspace, projectId, modelId, ticketId, group, isFederation }: UpdateTicketGroupAction) {
	try {
		yield API.Tickets.updateTicketGroup(teamspace, projectId, modelId, ticketId, group._id, getSanitizedSmartGroup(group), isFederation);
		yield put(TicketsActions.updateTicketGroupSuccess(group));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage(
				{ id: 'tickets.updateTicketGroup.error', defaultMessage: 'trying to update the group' },
			),
			error,
		}));
	}
}

export function* updateTicket({ teamspace, projectId, modelId, ticketId, ticket, isFederation, onError }: UpdateTicketAction) {
	try {
		const updateModelTicket = isFederation
			? API.Tickets.updateFederationTicket
			: API.Tickets.updateContainerTicket;

		yield updateModelTicket(teamspace, projectId, modelId, ticketId, ticket);
		addUpdatedAtTime(ticket);
		yield put(TicketsActions.upsertTicketSuccess(modelId, { _id: ticketId, ...ticket }));
		yield put(SnackbarActions.show(formatMessage({ id: 'tickets.updateTicket.updated', defaultMessage: 'Ticket updated' })));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage(
				{ id: 'tickets.updateTicket.error', defaultMessage: 'trying to update the ticket for {model} ' },
				{ model: getContainerOrFederationFormattedText(isFederation) },
			),
			error,
		}));
		onError?.();
	}
}

export function* createTicket({ teamspace, projectId, modelId, ticket, isFederation, onSuccess, onError }: CreateTicketAction) {
	try {
		const updateModelTicket = isFederation
			? API.Tickets.createFederationTicket
			: API.Tickets.createContainerTicket;
		const { _id: ticketId } = yield updateModelTicket(teamspace, projectId, modelId, ticket);
		const properties = { ...ticket.properties, 'Created at': new Date().getTime() };
		yield put(TicketsActions.upsertTicketSuccess(modelId, { _id: ticketId, ...ticket, properties }));
		onSuccess(ticketId);
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage(
				{ id: 'tickets.createTicket.error', defaultMessage: 'trying to create the ticket for {model} ' },
				{ model: getContainerOrFederationFormattedText(isFederation) },
			),
			error,
		}));
		onError();
	}
}

const getViewGroupsIds = (state: ViewpointState): string[] => {
	const colored = state.colored || [];
	const hidden = state.hidden || [];
	const transformed = state.transformed || [];

	return [...colored, ...hidden, ...transformed].map((val) => val.group as unknown as string);
};

const appendPropertiesGroupsToArray = (groupsIds: any[], properties: object) => {
	Object.keys(properties).forEach((propName) => {
		const { state } = properties[propName] || {};
		if (state) {
			Array.prototype.push.apply(groupsIds, getViewGroupsIds(state));
		}
	});
};

const getTicketsGroupsIds = (ticket: ITicket) => {
	const groupsIds = [];

	appendPropertiesGroupsToArray(groupsIds, ticket.properties);

	Object.keys(ticket.modules || {}).forEach((module) => {
		const properties = ticket.modules[module];
		appendPropertiesGroupsToArray(groupsIds, properties);
	});

	return groupsIds;
};

export function* fetchTicketGroups({ teamspace, projectId, modelId, ticketId, revision }: FetchTicketGroupsAction) {
	try {
		const ticket: ITicket = yield select(selectTicketByIdRaw, modelId, ticketId);
		const fetchedGroups = yield select(selectTicketsGroups);
		const isFed = !!(yield select(selectContainersByFederationId, modelId)).length;

		// The filter is to avoid re-fetching groups that were already fetched
		const groupsIds = getTicketsGroupsIds(ticket).filter((id) => isString(id) && !fetchedGroups[id]);

		const groups = yield all(
			groupsIds.map((groupId) => API.Tickets.fetchTicketGroup(teamspace, projectId, modelId, ticketId, groupId, isFed, revision)),
		);
		yield put(TicketsActions.fetchTicketGroupsSuccess(groups));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage(
				{ id: 'tickets.fetchTicketGroups.error', defaultMessage: 'trying to fetch the groups for a ticket' },
			),
			error,
		}));
	}
}

export function* fetchTicketGroupsAndGoToView({ teamspace, projectId, modelId, ticketId, revision }: FetchTicketGroupsAndGoToView) {
	try {
		yield put(TicketsActions.fetchTicketGroups(teamspace, projectId, modelId, ticketId, revision));
		yield take(TicketsTypes.FETCH_TICKET_GROUPS_SUCCESS);
		const ticketWithGroups = yield select(selectTicketById, modelId, ticketId);
		const defaultView = get(ticketWithGroups?.properties, AdditionalProperties.DEFAULT_VIEW);
		if (!defaultView) return;
		goToView(defaultView);
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage(
				{ id: 'tickets.fetchTicketGroupsAndGoToView.error', defaultMessage: 'trying to fetch the groups for a ticket and go to view' },
			),
			error,
		}));
	}
}
export function* upsertTicketAndFetchGroups({ teamspace, projectId, modelId, ticket, revision }: UpsertTicketAndFetchGroupsAction) {
	addUpdatedAtTime(ticket);
	yield put(TicketsActions.upsertTicketSuccess(modelId, ticket));
	yield put(TicketsActions.fetchTicketGroups(teamspace, projectId, modelId, ticket._id, revision));
}

export default function* ticketsSaga() {
	yield takeEvery(TicketsTypes.FETCH_TICKETS, fetchTickets);
	yield takeEvery(TicketsTypes.FETCH_TICKET, fetchTicket);
	yield takeLatest(TicketsTypes.FETCH_TEMPLATES, fetchTemplates);
	yield takeEvery(TicketsTypes.FETCH_TEMPLATE, fetchTemplate);
	yield takeLatest(TicketsTypes.UPDATE_TICKET, updateTicket);
	yield takeLatest(TicketsTypes.CREATE_TICKET, createTicket);
	yield takeLatest(TicketsTypes.FETCH_RISK_CATEGORIES, fetchRiskCategories);
	yield takeLatest(TicketsTypes.FETCH_TICKET_GROUPS, fetchTicketGroups);
	yield takeLatest(TicketsTypes.FETCH_TICKET_GROUPS_AND_GO_TO_VIEW, fetchTicketGroupsAndGoToView);
	yield takeLatest(TicketsTypes.UPSERT_TICKET_AND_FETCH_GROUPS, upsertTicketAndFetchGroups);
	yield takeLatest(TicketsTypes.UPDATE_TICKET_GROUP, updateTicketGroup);
	yield takeEvery(TicketsTypes.FETCH_TICKET_PROPERTIES, fetchTicketProperties);
}
