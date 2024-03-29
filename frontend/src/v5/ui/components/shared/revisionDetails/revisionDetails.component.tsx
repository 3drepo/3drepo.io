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

import { useEffect } from 'react';
import { min, range } from 'lodash';

import { Button } from '@controls/button';
import ArrowUpCircleIcon from '@assets/icons/filled/arrow_up_circle-filled.svg';
import { RevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ProjectsHooksSelectors, RevisionsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormattedMessage } from 'react-intl';
import { UploadStatuses } from '@/v5/store/containers/containers.types';
import { canUploadToBackend } from '@/v5/store/containers/containers.helpers';
import { uploadToContainer } from '@/v5/ui/routes/dashboard/projects/containers/uploadFileForm/uploadToContainer.component';
import { SkeletonListItem } from './components/skeletonListItem/skeletonListItem.component';
import { RevisionsListItem } from './components/revisionsListItem/revisionsListItem.component';
import { RevisionsListHeaderLabel } from './components/revisionsListHeaderLabel/revisionsListHeaderLabel.component';
import {
	Container,
	RevisionsListHeaderContainer,
	RevisionsListItemWrapper,
	RevisionsList,
	RevisionsListEmptyWrapper,
	RevisionsListEmptyContainer,
	RevisionsListEmptyText,
} from './revisionDetails.styles';

interface IRevisionDetails {
	containerId: string;
	revisionsCount: number;
	status?: UploadStatuses
}

export const RevisionDetails = ({ containerId, revisionsCount, status }: IRevisionDetails): JSX.Element => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const isLoading = RevisionsHooksSelectors.selectIsPending(containerId);
	const revisions = RevisionsHooksSelectors.selectRevisions(containerId)
		.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
	const selected = revisions.findIndex((r) => !r.void);

	useEffect(() => {
		if (!revisions.length) {
			RevisionsActionsDispatchers.fetch(teamspace, project, containerId);
		}
	}, []);

	if (!revisionsCount && !isLoading && !revisions.length) {
		return (
			<RevisionsListEmptyWrapper>
				<RevisionsListEmptyContainer>
					{
						canUploadToBackend(status) ? (
							<>
								<RevisionsListEmptyText>
									<FormattedMessage id="containers.revisions.emptyMessage" defaultMessage="You haven’t added any Files." />
								</RevisionsListEmptyText>
								<Button
									startIcon={<ArrowUpCircleIcon />}
									variant="contained"
									color="primary"
									onClick={() => uploadToContainer(containerId)}
								>
									<FormattedMessage id="containers.revisions.uploadFile" defaultMessage="Upload File" />
								</Button>
							</>
						) : (
							<RevisionsListEmptyText>
								<FormattedMessage id="containers.revisions.emptyMessageBusy" defaultMessage="Your files are being processed at this moment, please wait before creating new revisions for this container." />
							</RevisionsListEmptyText>
						)
					}
				</RevisionsListEmptyContainer>
			</RevisionsListEmptyWrapper>
		);
	}

	return (
		<Container>
			<RevisionsListHeaderContainer>
				<RevisionsListHeaderLabel width={140} tabletWidth={94}><FormattedMessage id="revisionDetails.addedOn" defaultMessage="Added on" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel width={170} tabletWidth={155}><FormattedMessage id="revisionDetails.addedBy" defaultMessage="Added by" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel width={150} tabletWidth={300}><FormattedMessage id="revisionDetails.revisionCode" defaultMessage="Revision name" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel hideWhenSmallerThan={1140}><FormattedMessage id="revisionDetails.description" defaultMessage="Description" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel width={90} tabletWidth={45} hideWhenSmallerThan={800}><FormattedMessage id="revisionDetails.format" defaultMessage="Format" /></RevisionsListHeaderLabel>
			</RevisionsListHeaderContainer>
			<RevisionsList>
				{isLoading ? (
					range(min([revisionsCount || 1, 5])).map((key) => <SkeletonListItem key={key} />)
				) : (
					revisions.map((revision, i) => (
						<RevisionsListItemWrapper
							selected={i === selected}
							isBeforeSelected={i === selected - 1}
							onClick={() => {}}
							key={revision._id}
						>
							<RevisionsListItem revision={revision} containerId={containerId} />
						</RevisionsListItemWrapper>
					))
				)}
			</RevisionsList>
		</Container>
	);
};
