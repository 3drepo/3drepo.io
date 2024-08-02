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
import { viewerRoute } from '@/v5/services/routing/routing';
import { FormattedMessage } from 'react-intl';
import { Tooltip } from '@mui/material';
import { getRevisionFileUrl } from '@/v5/services/api/revisions';
import { ContainersHooksSelectors, ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { Container, DownloadButton, DownloadIcon, RevisionsListItemTag } from './revisionsListItem.styles';
import { RevisionsListItemAuthor } from './revisionsListItemAuthor/revisionsListItemAuthor.component';
import { RevisionsListItemText } from './revisionsListItemText/revisionsListItemText.component';
import { RevisionsListItemButton } from './revisionsListItemButton/revisionsListItemButton.component';
import { formatShortDateTime } from '@/v5/helpers/intl.helper';
import { downloadAuthUrl } from '@components/authenticatedResource/authenticatedResource.hooks';

type IRevisionsListItem = {
	revision: IRevision;
	containerId: string;
};

export const RevisionsListItem = ({ revision, containerId }: IRevisionsListItem): JSX.Element => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const { timestamp, desc, author, tag, void: voidStatus, format } = revision;
	const disabled = voidStatus;

	const toggleVoidStatus = (e: SyntheticEvent) => {
		e.preventDefault();
		e.stopPropagation();
		RevisionsActionsDispatchers.setVoidStatus(teamspace, project, containerId, tag || revision._id, !voidStatus);
	};

	const downloadRevision = async (e: SyntheticEvent) => {
		e.preventDefault();
		const anchor = document.createElement('a');
		anchor.href = await downloadAuthUrl(getRevisionFileUrl(teamspace, project, containerId, revision._id)) ;
		anchor.download = revision.tag + revision.format;
		anchor.click();
	};
	const hasCollaboratorAccess = ContainersHooksSelectors.selectHasCollaboratorAccess(containerId);

	return (
		<Container to={disabled ? null : viewerRoute(teamspace, project, containerId, revision)} disabled={disabled}>
			<RevisionsListItemText width={140} tabletWidth={94}> {formatShortDateTime(timestamp)} </RevisionsListItemText>
			<RevisionsListItemAuthor width={170} tabletWidth={155} authorName={author} />
			<RevisionsListItemTag width={150} tabletWidth={300}> {tag} </RevisionsListItemTag>
			<RevisionsListItemText hideWhenSmallerThan={1140}> {desc} </RevisionsListItemText>
			<RevisionsListItemText width={90} tabletWidth={45} hideWhenSmallerThan={800}> {(format || '').toLowerCase()} </RevisionsListItemText>
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
