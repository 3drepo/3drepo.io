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

import { ViewerGui } from '@/v4/routes/viewerGui';
import { useParams } from 'react-router-dom';
import { ContainersHooksSelectors, FederationsHooksSelectors, TicketsHooksSelectors, ViewerHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsCardActionsDispatchers, ViewerActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useEffect, useState } from 'react';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { VIEWER_EVENTS } from '@/v4/constants/viewer';
import { ViewerGuiActions } from '@/v4/modules/viewerGui';
import { dispatch } from '@/v4/modules/store';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { CheckLatestRevisionReadiness } from './checkLatestRevisionReadiness/checkLatestRevisionReadiness.container';
import { ViewerParams } from '../routes.constants';
import { InvalidContainerOverlay, InvalidFederationOverlay } from './invalidViewerOverlay';
import { TicketsCardViews } from './tickets/tickets.constants';
import { OpenTicketFromUrl } from './openTicketFromUrl/openTicketFromUrl.component';
import { useSearchParam } from '../useSearchParam';

export const Viewer = () => {
	const [fetchPending, setFetchPending] = useState(true);

	const { teamspace, containerOrFederation, project, revision } = useParams<ViewerParams>();
	const [, setTicketId] = useSearchParam('ticketId');

	const isFetching = ViewerHooksSelectors.selectIsFetching();

	const isLoading = isFetching || fetchPending;

	const selectedContainer = ContainersHooksSelectors.selectContainerById(containerOrFederation);
	const selectedFederation = FederationsHooksSelectors.selectFederationById(containerOrFederation);
	const federationsContainers = FederationsHooksSelectors.selectContainersByFederationId(containerOrFederation);

	const federationIsEmpty = selectedFederation?.containers?.length === 0
		|| federationsContainers.every((container) => container?.revisionsCount === 0);

	const tickets = TicketsHooksSelectors.selectTickets(containerOrFederation);

	const handlePinClick = ({ id }) => {
		if (!tickets.some((t) => t._id === id)) return;

		setTicketId(id);
		TicketsCardActionsDispatchers.setCardView(TicketsCardViews.Details);
		dispatch(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.TICKETS, true));
	};

	useEffect(() => {
		ViewerService.on(VIEWER_EVENTS.CLICK_PIN, handlePinClick);
		return () => ViewerService.off(VIEWER_EVENTS.CLICK_PIN, handlePinClick);
	}, [tickets]);

	useEffect(() => {
		ViewerActionsDispatchers.fetchData(teamspace, project, containerOrFederation);
	}, [teamspace, project, containerOrFederation]);

	useEffect(() => { if (isFetching) setFetchPending(false); }, [isFetching]);

	if (isLoading) return null;

	if (selectedContainer?.revisionsCount === 0) {
		return <InvalidContainerOverlay status={selectedContainer.status} />;
	}

	if (selectedFederation && federationIsEmpty) {
		return <InvalidFederationOverlay containers={federationsContainers} />;
	}

	const v4Match = {
		params: {
			model: containerOrFederation,
			project,
			teamspace,
			revision,
		},
	};

	return (
		<>
			<OpenTicketFromUrl />
			<CheckLatestRevisionReadiness />
			<ViewerGui match={v4Match} key={containerOrFederation} />
		</>
	);
};
