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

import { useHistory, useParams, generatePath } from 'react-router-dom';
import { formatMessage } from '@/v5/services/intl';
import { IContainer } from '@/v5/store/containers/containers.types';
import { Button } from '@controls/button';
import { FormattedMessage } from 'react-intl';
import { Heading, OverlayContainer, Subheading } from './invalidViewerOverlay.styles';
import { DashboardParams, FEDERATIONS_ROUTE } from '../../routes.constants';

type IInvalidFederation = {
	containers: IContainer[];
};

export const InvalidFederationOverlay = ({ containers }: IInvalidFederation) => {
	const history = useHistory();
	const params = useParams<DashboardParams>();
	const containersListRoute = generatePath(FEDERATIONS_ROUTE, params);

	let message = 'Error!';
	if (!containers.length) {
		message = formatMessage({
			id: 'noRevisionOverlay.subheading.federation.noContainers',
			defaultMessage: 'You\'ll need to add some Containers.',
		});
	} else if (containers.every((c) => !c.revisionsCount)) {
		message = formatMessage({
			id: 'noRevisionOverlay.subheading.federation.noRevisions',
			defaultMessage: 'All Containers are empty. You\'ll need to upload some revisions.',
		});
	}

	const onClickBack = () => history.push(containersListRoute);

	return (
		<OverlayContainer>
			<Heading>
				<FormattedMessage
					id="invalidFederationOverlay.heading"
					defaultMessage="The Federation is empty"
				/>
			</Heading>
			<Subheading>
				{message}
			</Subheading>
			<Button onClick={onClickBack} variant="contained">
				<FormattedMessage
					id="invalidFederationOverlay.backButton"
					defaultMessage="Back to Federations"
				/>
			</Button>
		</OverlayContainer>
	);
};
