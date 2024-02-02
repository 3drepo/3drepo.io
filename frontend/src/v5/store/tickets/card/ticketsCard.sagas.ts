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

import { put, select, takeLatest } from 'redux-saga/effects';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { TicketsCardViews } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { ViewerGuiActions } from '@/v4/modules/viewerGui/viewerGui.redux';
import { GoBackFromTicketGroupsAction, OpenTicketAction, TicketsCardActions, TicketsCardTypes } from './ticketsCard.redux';
import { goToView } from '@/v5/helpers/viewpoint.helpers';
import { get } from 'lodash';
import { Viewpoint } from '../tickets.types';
import { selectViewProps } from './ticketsCard.selectors';

export function* openTicket({ ticketId }: OpenTicketAction) {
	yield put(TicketsCardActions.setSelectedTicket(ticketId));
	yield put(TicketsCardActions.setCardView(TicketsCardViews.Details));
	yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.TICKETS, true));
}

export function* goBackFromTicketGroups({ ticket }: GoBackFromTicketGroupsAction ) {
	const viewProps = yield select(selectViewProps);
	const viewpoint = get(ticket, viewProps.name) as Viewpoint;
	const { state } = viewpoint || {};
	goToView({ state });
	yield put(TicketsCardActions.setOverrides(null));
	yield put(TicketsCardActions.setCardView(TicketsCardViews.Details));
}

export default function* ticketsCardSaga() {
	yield takeLatest(TicketsCardTypes.OPEN_TICKET, openTicket);
	yield takeLatest(TicketsCardTypes.GO_BACK_FROM_TICKET_GROUPS, goBackFromTicketGroups);
}
