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
import { SyntheticEvent } from 'react';

import { RevisionsListItemText } from '@components/shared/revisionDetails/components/revisionsListItemText';
import { RevisionsListItemDate } from '@components/shared/revisionDetails/components/revisionsListItemDate';
import { RevisionsListItemAuthor } from '@components/shared/revisionDetails/components/revisionsListItemAuthor';
import { RevisionsListItemCode } from '@components/shared/revisionDetails/components/revisionsListItemCode';
import { RevisionsListItemButton } from '@components/shared/revisionDetails/components/revisionsListItemButton';
import { IRevision } from '@/v5/store/revisions/revisions.types';
import { RevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatDate } from '@/v5/services/intl';
import { viewerRoute } from '@/v5/services/routing/routing';
import { FormattedMessage } from 'react-intl';
import { Tooltip } from '@mui/material';
import { getRevisionFileUrl } from '@/v5/services/api/revisions';
import { ContainersHooksSelectors, ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { Container, DownloadButton, DownloadIcon } from './revisionsListItem.styles';

type IRevisionsListItem = {
	revision: IRevision;
	active?: boolean;
	containerId: string;
};

export const RevisionsListItem = ({ revision, containerId, active = false }: IRevisionsListItem): JSX.Element => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const { timestamp, desc, author, tag, void: voidStatus } = revision;

	const toggleVoidStatus = (e: SyntheticEvent) => {
		e.preventDefault();
		e.stopPropagation();
		RevisionsActionsDispatchers.setVoidStatus(teamspace, project, containerId, tag || revision._id, !voidStatus);
	};

	const downloadRevision = (e: SyntheticEvent) => {
		e.preventDefault();
		window.location.href = getRevisionFileUrl(teamspace, project, containerId, revision._id);
	};
	const hasCollaboratorAccess = ContainersHooksSelectors.selectHasCollaboratorAccess(containerId);

	return (
		<Container to={viewerRoute(teamspace, project, containerId, revision)}>
			<RevisionsListItemDate width={130} tabletWidth={94} active={active}>
				{formatDate(timestamp)}
			</RevisionsListItemDate>
			<RevisionsListItemAuthor authorName={author} active={active} width={228} tabletWidth={155} />
			<RevisionsListItemCode width="20%" tabletWidth={150}> {tag} </RevisionsListItemCode>
			<RevisionsListItemText hideWhenSmallerThan={887} active={active}> {desc} </RevisionsListItemText>
			<RevisionsListItemButton onClick={toggleVoidStatus} status={voidStatus} disabled={!hasCollaboratorAccess} />
			{ hasCollaboratorAccess && (
				<Tooltip
					title={(
						<FormattedMessage
							id="revisionDetails.list.item.download.tooltip"
							defaultMessage="Download revision"
						/>
					)}
				>
					<DownloadButton
						onClick={downloadRevision}
					>
						<DownloadIcon />
					</DownloadButton>
				</Tooltip>
			)}
		</Container>
	);
};
