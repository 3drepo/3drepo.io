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

import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useEffect, useState } from 'react';
import { useSearchParam } from '../useSearchParam';
import { useParams } from 'react-router';
import { ViewerParams } from '../routes.constants';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { isEmpty } from 'lodash';

export const useApplyViewForTicketURL = () => {
	const { containerOrFederation, teamspace, project, revision } = useParams<ViewerParams>();
	const [ticketId] = useSearchParam('ticketId');
	const tickets = TicketsHooksSelectors.selectTickets(containerOrFederation);
	const templates = TicketsHooksSelectors.selectTemplates(containerOrFederation);
	const hasTicketData = !isEmpty(tickets) && !isEmpty(templates);
	const [lastTicketId, setLasticketId] = useState('');


	useEffect(() => {
		if (!ticketId || !hasTicketData || lastTicketId === ticketId) return;
		TicketsActionsDispatchers.fetchTicketGroupsAndGoToView(teamspace, project, containerOrFederation, ticketId, revision);
		setLasticketId(ticketId);
	}, [ticketId, hasTicketData, lastTicketId]);
	
};
