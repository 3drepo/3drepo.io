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
import { Trans } from '@lingui/react';
import { RevisionStatus } from '@/v5/ui/routes/dashboard/projects/containers/containersList/latestRevision/revisionStatus';
import { IRevisionStatus } from '@/v5/ui/routes/dashboard/projects/containers/containersList/latestRevision/revisionStatus/revisionStatus.component';
import { UploadStatuses } from '@/v5/store/containers/containers.types';
import { Container, Label } from './latestRevision.styles';

interface ILatestRevision extends IRevisionStatus {
	hasRevisions: boolean;
}

export const LatestRevision = ({ hasRevisions, status, ...props }: ILatestRevision): JSX.Element => (
	<Container>
		{hasRevisions || status === UploadStatuses.UPLOADING ? (
			<>
				<Label>
					<Trans
						id="containers.list.item.latestRevision.label"
						message="Latest revision: "
					/>
				</Label>
				<RevisionStatus status={status} {...props} />
			</>
		) : (
			<Label>
				<Trans
					id="containers.list.item.latestRevision.emptyContainer"
					message="Container empty"
				/>
			</Label>
		)}
	</Container>
);
