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
import { DrawingRevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ProjectsHooksSelectors, TeamspacesHooksSelectors, DrawingRevisionsHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormattedMessage } from 'react-intl';
import { DrawingUploadStatus } from '@/v5/store/drawings/drawings.types';
import { canUploadToBackend } from '@/v5/store/drawings/drawings.helpers';
import { uploadToDrawing } from '@/v5/ui/routes/dashboard/projects/drawings/uploadDrawingRevisionForm/uploadDrawingRevisionForm.helpers';
import { SkeletonListItem } from '../revisionDetails/components/skeletonListItem/skeletonListItem.component';
import { RevisionsListItem } from '../revisionDetails/components/revisionsListItem/revisionsListItem.component';
import { RevisionsListHeaderLabel } from '../revisionDetails/components/revisionsListHeaderLabel/revisionsListHeaderLabel.component';
import {
	Container,
	RevisionsListHeaderContainer,
	RevisionsListItemWrapper,
	RevisionsList,
	RevisionsListEmptyWrapper,
	RevisionsListEmptyContainer,
	RevisionsListEmptyText,
} from '../revisionDetails/revisionDetails.styles';
import { getRevisionFileUrl } from '@/v5/services/api/drawingRevisions';
import { selectHasCollaboratorAccess } from '@/v5/store/drawings/drawings.selectors';
import { getState } from '@/v4/modules/store';
import { RevisionsListItemText } from '../revisionDetails/components/revisionsListItem/revisionsListItemText/revisionsListItemText.component';
import { RevisionsListItemAuthor } from '../revisionDetails/components/revisionsListItem/revisionsListItemAuthor/revisionsListItemAuthor.component';
import { RevisionsListItemTag } from '../revisionDetails/components/revisionsListItem/revisionsListItem.styles';
import { formatShortDateTime } from '@/v5/helpers/intl.helper';
import { IDrawingRevision } from '@/v5/store/drawings/revisions/drawingRevisions.types';

interface IDrawingRevisionDetails {
	drawingId: string;
	revisionsCount: number;
	status?: DrawingUploadStatus;
}
export const DrawingRevisionDetails = ({ drawingId, revisionsCount, status }: IDrawingRevisionDetails): JSX.Element => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const isLoading = DrawingRevisionsHooksSelectors.selectIsPending(drawingId);
	const revisions = DrawingRevisionsHooksSelectors.selectRevisions(drawingId)
		.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
	const selected = revisions.findIndex((r) => !r.void);

	const handleDownloadRevision = async (revision: IDrawingRevision) => {
		const anchor = document.createElement('a');
		anchor.href = await getRevisionFileUrl(teamspace, project, drawingId, revision._id);
		anchor.download = `${revision.revCode}-${revision.statusCode}`;
		anchor.click();
	};

	useEffect(() => {
		if (!revisions.length) {
			DrawingRevisionsActionsDispatchers.fetch(teamspace, project, drawingId);
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
									<FormattedMessage id="drawings.revisions.emptyMessage" defaultMessage="You haven’t added any Files." />
								</RevisionsListEmptyText>
								<Button
									startIcon={<ArrowUpCircleIcon />}
									variant="contained"
									color="primary"
									onClick={() => uploadToDrawing(drawingId)}
								>
									<FormattedMessage id="drawings.revisions.uploadFile" defaultMessage="Upload File" />
								</Button>
							</>
						) : (
							<RevisionsListEmptyText>
								<FormattedMessage id="drawings.revisions.emptyMessageBusy" defaultMessage="Your files are being processed at this moment, please wait before creating new revisions for this drawing." />
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
				<RevisionsListHeaderLabel width={140} tabletWidth={94}><FormattedMessage id="drawingRevisionDetails.addedOn" defaultMessage="Added on" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel width={170} tabletWidth={155}><FormattedMessage id="drawingRevisionDetails.addedBy" defaultMessage="Added by" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel width={150} tabletWidth={300}><FormattedMessage id="drawingRevisionDetails.statusCode" defaultMessage="Status code" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel width={150} tabletWidth={300}><FormattedMessage id="drawingRevisionDetails.revisionCode" defaultMessage="Revision code" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel hideWhenSmallerThan={1140}><FormattedMessage id="drawingRevisionDetails.description" defaultMessage="Description" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel width={90} tabletWidth={45} hideWhenSmallerThan={800}><FormattedMessage id="drawingRevisionDetails.format" defaultMessage="Format" /></RevisionsListHeaderLabel>
			</RevisionsListHeaderContainer>
			<RevisionsList>
				{isLoading ? (
					range(min([revisionsCount || 1, 5])).map((key) => <SkeletonListItem key={key} />)
				) : (
					revisions.map((revision, i) => (
						<RevisionsListItemWrapper
							selected={i === selected}
							isBeforeSelected={i === selected - 1}
							key={revision._id}
						>
							<RevisionsListItem
								onSetVoidStatus={(voidStatus) => (
									DrawingRevisionsActionsDispatchers.setVoidStatus(teamspace, project, drawingId, revision._id, voidStatus)
								)}
								voidStatus={revision.void}
								onDownloadRevision={() => handleDownloadRevision(revision)}
								hasPermission={selectHasCollaboratorAccess(getState(), drawingId)}
							>
								<RevisionsListItemText width={140} tabletWidth={94}> {formatShortDateTime(revision.timestamp)} </RevisionsListItemText>
								<RevisionsListItemAuthor width={170} tabletWidth={155} authorName={revision.author} />
								<RevisionsListItemTag width={150} tabletWidth={300}> {revision.statusCode || ''} </RevisionsListItemTag>
								<RevisionsListItemTag width={150} tabletWidth={300}> {revision.revCode} </RevisionsListItemTag>
								<RevisionsListItemText hideWhenSmallerThan={1140}> {revision.desc || ''} </RevisionsListItemText>
								<RevisionsListItemText width={90} tabletWidth={45} hideWhenSmallerThan={800}> {(revision.format || '').toLowerCase()} </RevisionsListItemText>
							</RevisionsListItem>
						</RevisionsListItemWrapper>
					))
				)}
			</RevisionsList>
		</Container>
	);
};
