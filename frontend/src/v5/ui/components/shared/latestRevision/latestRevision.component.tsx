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

import { FormattedMessage } from 'react-intl';

import { UploadStatus } from '@/v5/store/containers/containers.types';
import { Container, Label } from './latestRevision.styles';
import { IRevisionStatus, RevisionStatus } from './revisionStatus/revisionStatus.component';

interface ILatestRevision extends IRevisionStatus {
	hasRevisions: boolean;
	emptyLabel: string;
}

export const LatestRevision = ({ hasRevisions, status, emptyLabel, ...props }: ILatestRevision): JSX.Element => (
	<Container disabled={!hasRevisions}>
		{hasRevisions || status !== UploadStatus.OK ? (
			<>
				<Label>
					<FormattedMessage
						id="latestRevision.label"
						defaultMessage="Latest revision: "
					/>
				</Label>
				<RevisionStatus status={status} {...props} />
			</>
		) : <Label>{emptyLabel}</Label>}
	</Container>
);
