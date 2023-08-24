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

import { IRevision } from '@/v5/store/revisions/revisions.types';
import { RevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatDate } from '@/v5/services/intl';
import { viewerRoute } from '@/v5/services/routing/routing';
import { FormattedMessage } from 'react-intl';
import { Tooltip } from '@mui/material';
import { getRevisionFileUrl } from '@/v5/services/api/revisions';
import { ContainersHooksSelectors, ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { Container, DownloadButton, DownloadIcon, RevisionsListItemFormat } from './revisionsListItem.styles';
import { RevisionsListItemAuthor } from './revisionsListItemAuthor/revisionsListItemAuthor.component';
import { RevisionsListItemText } from './revisionsListItemText/revisionsListItemText.component';
import { RevisionsListItemButton } from './revisionsListItemButton/revisionsListItemButton.component';

type IRevisionsListItem = {
	revision: IRevision;
	active?: boolean;
	containerId: string;
};

export const RevisionsListItem = ({ revision, containerId, active = false }: IRevisionsListItem): JSX.Element => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const { timestamp, desc, author, tag, void: voidStatus, format } = revision;

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
			<RevisionsListItemTag width="20%" tabletWidth={150}> {tag} </RevisionsListItemTag>
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
