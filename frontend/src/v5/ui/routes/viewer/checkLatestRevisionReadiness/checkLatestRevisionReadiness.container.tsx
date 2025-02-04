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

import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { ContainersHooksSelectors, FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { canUploadToBackend } from '@/v5/store/containers/containers.helpers';
import { useEffect } from 'react';
import { useHistory, generatePath, useParams } from 'react-router-dom';
import { TEAMSPACE_ROUTE_BASE, ViewerParams } from '../../routes.constants';

export const CheckLatestRevisionReadiness = (): JSX.Element => {
	const history = useHistory();
	const { teamspace, containerOrFederation } = useParams<ViewerParams>();
	const isContainer = ContainersHooksSelectors.selectContainerById(containerOrFederation);
	const isFederation = FederationsHooksSelectors.selectContainersByFederationId(containerOrFederation);

	const checkContainerReadiness = (container) => {
		if (!canUploadToBackend(container.status) && container.revisionsCount) {
			DialogsActionsDispatchers.open('info', {
				title: formatMessage(
					{ id: 'viewer.latestRevisionNotReady.title', defaultMessage: 'The latest revision is still processing' },
				),
				message: formatMessage({
					id: 'viewer.latestRevisionNotReady.message',
					defaultMessage: 'Until processing has completed, we can only show the latest available revision.',
				}),
				closeButtonLabel: formatMessage({
					id: 'viewer.latestRevisionNotReady.primaryLabel',
					defaultMessage: 'Go to viewer',
				}), 
				actionButtonLabel: formatMessage({
					id: 'infoModal.action.secondaryDefault',
					defaultMessage: 'Go back to Teamspace',
				}),
				onClickAction: () => {
					history.push(generatePath(TEAMSPACE_ROUTE_BASE, { teamspace }));
				},
			});
		}
	};

	useEffect(() => {
		if (isContainer) {
			checkContainerReadiness(isContainer);
		}
		if (isFederation) {
			isFederation.forEach(
				(container) => checkContainerReadiness(container),
			);
		}
	}, [containerOrFederation]);

	return <></>;
};
