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

import { IContainer } from '@/v5/store/containers/containers.types';
import { LatestRevision } from '@/v5/ui/routes/dashboard/projects/containers/containersList/latestRevision';
import { FormattedMessage } from 'react-intl';
import { ExistingContainerOption, InUseText, Name } from './existingContainer.styles';

interface IExistingContainer {
	container: IContainer;
	latestRevision: string;
	inUse: boolean;
}

export const ExistingContainer = ({ container, latestRevision, inUse, ...props }: IExistingContainer) => (
	<ExistingContainerOption {...props}>
		<Name>{container.name}</Name>
		<LatestRevision
			hasRevisions={!!container.revisionsCount}
			name={container.latestRevision}
			status={container.status}
		/>
		<InUseText hidden={!inUse}>
			<FormattedMessage id="uploads.destination.containerInUse" defaultMessage="Already in use in another file upload" />
		</InUseText>
	</ExistingContainerOption>
);
