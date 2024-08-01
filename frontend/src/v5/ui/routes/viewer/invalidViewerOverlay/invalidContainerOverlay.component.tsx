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

import { formatMessage } from '@/v5/services/intl';
import { canUploadToBackend } from '@/v5/store/containers/containers.helpers';
import { UploadStatuses } from '@/v5/store/containers/containers.types';
import { Button } from '@controls/button';
import { useHistory, useParams, generatePath } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Heading, OverlayContainer, Subheading } from './invalidViewerOverlay.styles';
import { CONTAINERS_ROUTE, DashboardParams } from '../../routes.constants';

type IInvalidContainer = {
	status: UploadStatuses;
};

export const InvalidContainerOverlay = ({ status }: IInvalidContainer) => {
	const history = useHistory();
	const params = useParams<DashboardParams>();
	const containersListRoute = generatePath(CONTAINERS_ROUTE, params);

	const message = canUploadToBackend(status) ? (
		formatMessage({
			id: 'noRevisionOverlay.subheading.container.notProcessing',
			defaultMessage: 'You\'ll need to upload a new revision.',
		})
	) : (
		formatMessage({
			id: 'noRevisionOverlay.subheading.container.processing',
			defaultMessage: 'The Container is empty, you\'ll need to wait for the Container to finish processing.',
		})
	);

	const onClickBack = () => history.push(containersListRoute);

	return (
		<OverlayContainer>
			<Heading>
				<FormattedMessage
					id="InvalidContainerOverlay.heading"
					defaultMessage="The Container is empty"
				/>
			</Heading>
			<Subheading>
				{message}
			</Subheading>
			<Button onClick={onClickBack} variant="contained">
				<FormattedMessage
					id="InvalidContainerOverlay.backButton"
					defaultMessage="Back to Containers"
				/>
			</Button>
		</OverlayContainer>
	);
};
