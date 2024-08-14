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

import { FormattedMessage } from 'react-intl';
import { Tooltip } from '@mui/material';
import { Container, DownloadButton, DownloadIcon } from './revisionsListItem.styles';
import { RevisionsListItemButton } from './revisionsListItemButton/revisionsListItemButton.component';
import { downloadAuthUrl } from '@components/authenticatedResource/authenticatedResource.hooks';
import { formatDateTime } from '@/v5/helpers/intl.helper';

type IRevisionsListItem = {
	onSetVoidStatus: (voidStatus: boolean) => void;
	hasPermission: boolean;
	voidStatus: boolean,
	children: any,
	onDownloadRevision: () => void;
	redirectTo?: string;
};

export const RevisionsListItem = ({
	onSetVoidStatus,
	hasPermission,
	voidStatus,
	redirectTo = null,
	onDownloadRevision,
	children,
}: IRevisionsListItem): JSX.Element => {
	const disabled = voidStatus;

	const toggleVoidStatus = (e: SyntheticEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onSetVoidStatus(!voidStatus);
	};

	const downloadRevision = async (e: SyntheticEvent) => {
		e.preventDefault();
		onDownloadRevision();
	};

	return (
		<Container to={disabled ? null : viewerRoute(teamspace, project, containerId, revision)} disabled={disabled}>
			<RevisionsListItemText width={140} tabletWidth={94}> {formatDateTime(timestamp)} </RevisionsListItemText>
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
					<DownloadButton onClick={downloadRevision}>
						<DownloadIcon />
					</DownloadButton>
				</Tooltip>
			)}
		</Container>
	);
};
