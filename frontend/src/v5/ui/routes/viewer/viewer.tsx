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
import { useDispatch } from 'react-redux';
import { ModelActions } from '@/v4/modules/model';
import { InvalidContainerOverlay, InvalidFederationOverlay } from './invalidViewerOverlay';
import { ViewerParams } from '../routes.constants';
import { CheckLatestRevisionReadiness } from './checkLatestRevisionReadiness/checkLatestRevisionReadiness.container';
import { useContainersData } from '../dashboard/projects/containers/containers.hooks';
import { useFederationsData } from '../dashboard/projects/federations/federations.hooks';

export const Viewer = () => {
	const [fetchPending, setFetchPending] = useState(true);

	const { teamspace, containerOrFederation, project, revision } = useParams<ViewerParams>();
	TicketsCardActionsDispatchers.resetState();
	const isFetching = ViewerHooksSelectors.selectIsFetching();

	useEffect(() => {
		ViewerActionsDispatchers.fetchData(teamspace, containerOrFederation, project, revision);
	}, []);

	useEffect(() => { if (isFetching) setFetchPending(false); }, [isFetching]);

	if (isFetching || fetchPending) {
		console.log('not a lot of things');
		return (<>the dude is fetching</>);
	}

	console.log('Done');
	return (<>Fetched</>);

	// useContainersData();
	// useFederationsData();

	// const areFederationStatsPending = FederationsHooksSelectors.selectAreStatsPending();
	// const isFederationListPending = FederationsHooksSelectors.selectIsListPending();
	// const areContainersPending = ContainersHooksSelectors.selectAreStatsPending();
	// const isContainerListPending = ContainersHooksSelectors.selectIsListPending();

	// // eslint-disable-next-line max-len
	// const isLoading = areFederationStatsPending || isFederationListPending || areContainersPending || isContainerListPending;

	// const selectedContainer = ContainersHooksSelectors.selectContainerById(containerOrFederation);
	// const selectedFederation = FederationsHooksSelectors.selectFederationById(containerOrFederation);
	// const federationsContainers = FederationsHooksSelectors.selectContainersByFederationId(containerOrFederation);

	// const federationIsEmpty = selectedFederation?.containers?.length === 0
	// 	|| federationsContainers.every((container) => container?.revisionsCount === 0);

	// useEffect(() => () => dispatch(ModelActions.reset()), []);

	// if (isLoading) {
	// 	return (<></>);
	// }

	// if (selectedContainer?.revisionsCount === 0) {
	// 	return <InvalidContainerOverlay status={selectedContainer.status} />;
	// }

	// if (selectedFederation && federationIsEmpty) {
	// 	return <InvalidFederationOverlay containers={federationsContainers} />;
	// }

	// const v4Match = {
	// 	params: {
	// 		model: containerOrFederation,
	// 		project,
	// 		teamspace,
	// 		revision,
	// 	},
	// };

	// return (
	// 	<>
	// 		<CheckLatestRevisionReadiness />
	// 		<ViewerGui match={v4Match} key={containerOrFederation} />
	// 	</>
	// );
};
