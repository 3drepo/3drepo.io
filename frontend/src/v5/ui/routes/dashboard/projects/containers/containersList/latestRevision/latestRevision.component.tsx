/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import React from 'react';
import { RevisionStatus } from '@/v5/ui/routes/dashboard/projects/containers/containersList/latestRevision/revisionStatus';
import { IRevisionStatus } from '@/v5/ui/routes/dashboard/projects/containers/containersList/latestRevision/revisionStatus/revisionStatus.component';
import { ContainerStatuses } from '@/v5/store/containers/containers.types';
import { FormattedMessage } from 'react-intl';
import { Container, Label } from './latestRevision.styles';

interface ILatestRevision extends IRevisionStatus {
	hasRevisions: boolean;
}

export const LatestRevision = ({ hasRevisions, status, ...props }: ILatestRevision): JSX.Element => (
	<Container>
		{hasRevisions || status === ContainerStatuses.UPLOADING ? (
			<>
				<Label>
					<FormattedMessage
						id="containers.list.item.latestRevision.label"
						defaultMessage="Latest revision: "
					/>
				</Label>
				<RevisionStatus status={status} {...props} />
			</>
		) : (
			<Label>
				<FormattedMessage
					id="containers.list.item.latestRevision.emptyContainer"
					defaultMessage="Container empty"
				/>
			</Label>
		)}
	</Container>
);
