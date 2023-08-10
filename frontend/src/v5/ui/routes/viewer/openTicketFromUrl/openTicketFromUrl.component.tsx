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

import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { isEmpty } from 'lodash';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { ViewerGuiActions } from '@/v4/modules/viewerGui';
import { dispatch } from '@/v4/modules/store';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { ViewerParams } from '../../routes.constants';
import { useSearchParam } from '../../useSearchParam';
import { TicketsCardViews } from '../tickets/tickets.constants';

export const OpenTicketFromUrl = () => {
	const [ticketId, setTicketId] = useSearchParam('ticketId');
	const { containerOrFederation } = useParams<ViewerParams>();

	const tickets = TicketsHooksSelectors.selectTickets(containerOrFederation);
	const templates = TicketsHooksSelectors.selectTemplates(containerOrFederation);
	const hasTicketData = !isEmpty(tickets) && !isEmpty(templates);

	useEffect(() => {
		if (ticketId && hasTicketData) {
			if (!tickets.some(({ _id }) => _id === ticketId)) {
				console.log('ERROR NO SUCH TICKET');
				setTicketId('');
				return;
			}
			dispatch(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.TICKETS, true));
			TicketsCardActionsDispatchers.setCardView(TicketsCardViews.Details);
		}
	}, [ticketId, hasTicketData]);

	return <></>;
};
