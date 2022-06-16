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

import { useEffect } from 'react';
import { ViewerGui } from '@/v4/routes/viewerGui';
import { useHistory, useParams, generatePath } from 'react-router-dom';
import { formatMessage } from '@/v5/services/intl';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers/dialogsActions.dispatchers';
import { canUploadToBackend } from '@/v5/store/containers/containers.helpers';
import { PROJECTS_LIST_ROUTE, ViewerParams } from '../routes.constants';
import { useFederationsData } from '../dashboard/projects/federations/federations.hooks';
import { useContainersData } from '../dashboard/projects/containers/containers.hooks';
import { NoRevisionOverlay } from './noRevisionOverlay';

export const Viewer = () => {
	const { teamspace, containerOrFederation, revision } = useParams<ViewerParams>();
	const history = useHistory();
	const v4Match = {
		params: {
			model: containerOrFederation,
			teamspace,
			revision,
		} };

	const { federations } = useFederationsData();
	const { containers } = useContainersData();

	const getContainerFromId = (containerId: string) => containers.find((container) => container._id === containerId);
	const getFederationFromId = (federationId: string) => federations.find(
		(federation) => federation._id === federationId,
	);
	const selectedFederation = getFederationFromId(containerOrFederation);
	const selectedContainer = getContainerFromId(containerOrFederation);

	const checkLatestRevisionReady = (container) => {
		if ((!canUploadToBackend(container.status))
			&& container.revisionsCount
		) {
			DialogsActionsDispatchers.open('info', {
				title: formatMessage(
					{ id: 'viewer.latestRevisionNotReady.title', defaultMessage: 'The latest revision is still processing' },
				),
				message: formatMessage({
					id: 'viewer.latestRevisionNotReady.message',
					defaultMessage: 'Until processing has completed, we can only show the latest available revision.',
				}),
				primaryButtonLabel: formatMessage({
					id: 'viewer.latestRevisionNotReady.primaryLabel',
					defaultMessage: 'Go to viewer',
				}),
				onClickSecondary: () => {
					history.push(generatePath(PROJECTS_LIST_ROUTE, { teamspace }));
				},
			});
		}
	};

	useEffect(() => {
		if (selectedContainer) {
			checkLatestRevisionReady(selectedContainer);
		}
		if (selectedFederation) {
			selectedFederation.containers.forEach(
				(containerId) => checkLatestRevisionReady(getContainerFromId(containerId)),
			);
		}
	}, [selectedContainer, selectedFederation]);

	if (selectedContainer && !selectedContainer.hasStatsPending) {
		if (!selectedContainer.revisionsCount) {
			return <NoRevisionOverlay isProcessing={!canUploadToBackend(selectedContainer.status)} isContainer />;
		}
	}

	if (selectedFederation && !selectedFederation.hasStatsPending) {
		if (!selectedFederation.containers.length) {
			return <NoRevisionOverlay isProcessing={false} isContainer={false} />;
		}
	}

	return <ViewerGui match={v4Match} />;
};
