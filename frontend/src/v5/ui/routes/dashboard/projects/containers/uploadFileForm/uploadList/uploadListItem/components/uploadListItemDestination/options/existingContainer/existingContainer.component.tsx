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

import { FormattedMessage } from 'react-intl';
import { Container, LastRevision, ErrorText } from './existingContainer.styles';

interface IExistingContainer {
	containerName: string;
	latestRevision: string;
	inUse: boolean;
}

const noneText = <FormattedMessage id="uploads.destination.lastRevision.none" defaultMessage="None" />;

export const ExistingContainer = ({ containerName, latestRevision, inUse, ...props }: IExistingContainer) => (
	<Container {...props}>
		{containerName}
		<LastRevision>
			<FormattedMessage id="uploads.destination.lastRevision" defaultMessage="Last revision: " />
			{latestRevision || noneText}
		</LastRevision>
		<ErrorText hidden={!inUse}>
			<FormattedMessage id="uploads.destination.containerInUse" defaultMessage="Already in use in another file upload" />
		</ErrorText>
	</Container>
);
