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
import { IContainer } from '@/v5/store/containers/containers.types';
import { FormattedMessage } from 'react-intl';
import { Heading, OverlayContainer, Subheading } from './invalidViewerOverlay.styles';

type IInvalidFederation = {
	containers: IContainer[];
};

export const InvalidFederationOverlay = ({ containers }: IInvalidFederation) => {
	let message = 'Error!';
	console.log({ containers });
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
	return (
		<OverlayContainer>
			<Heading>
				<FormattedMessage
					id="InvalidFederationOverlay.heading"
					defaultMessage="The Federation is empty"
				/>
			</Heading>
			<Subheading>
				{message}
			</Subheading>
		</OverlayContainer>
	);
};
