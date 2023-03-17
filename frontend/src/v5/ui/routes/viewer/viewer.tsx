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
import { ContainersHooksSelectors, FederationsHooksSelectors, ViewerHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsCardActionsDispatchers, ViewerActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useEffect, useState } from 'react';
import { InvalidContainerOverlay, InvalidFederationOverlay } from './invalidViewerOverlay';
import { ViewerParams } from '../routes.constants';
import { CheckLatestRevisionReadiness } from './checkLatestRevisionReadiness/checkLatestRevisionReadiness.container';

export const Viewer = () => {
	const [fetchPending, setFetchPending] = useState(true);

	const { teamspace, containerOrFederation, project, revision } = useParams<ViewerParams>();
	TicketsCardActionsDispatchers.resetState();
	const isFetching = ViewerHooksSelectors.selectIsFetching();

	useEffect(() => {
		ViewerActionsDispatchers.fetchData(teamspace, project, containerOrFederation);
	}, [teamspace, project, containerOrFederation]);

	useEffect(() => { if (isFetching) setFetchPending(false); }, [isFetching]);

	const isLoading = isFetching || fetchPending;

	const selectedContainer = ContainersHooksSelectors.selectContainerById(containerOrFederation);
	const selectedFederation = FederationsHooksSelectors.selectFederationById(containerOrFederation);
	const federationsContainers = FederationsHooksSelectors.selectContainersByFederationId(containerOrFederation);

	const federationIsEmpty = selectedFederation?.containers?.length === 0
		|| federationsContainers.every((container) => container?.revisionsCount === 0);

	if (isLoading) {
		return (<></>);
	}

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
			<CheckLatestRevisionReadiness />
			<ViewerGui match={v4Match} key={containerOrFederation} />
		</>
	);
};
