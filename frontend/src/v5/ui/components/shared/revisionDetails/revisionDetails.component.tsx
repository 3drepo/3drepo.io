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

import { Trans } from '@lingui/react';
import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { RevisionsListHeaderLabel } from '@components/shared/revisionDetails/components/revisionsListHeaderLabel';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers/containersActions.dispatchers';
import { IRevisions } from '@/v5/store/containers/containers.types';
import { DashboardListEmptyText } from '@components/dashboard/dashboardList/dasboardList.styles';
import { NewContainerButton } from '@/v5/ui/routes/dashboard/projects/containers/containers.styles';
import AddCircleIcon from '@assets/icons/add_circle.svg';
import { RevisionsListItem } from '@components/shared/revisionDetails/components/revisionsListItem';
import {
	Container, RevisionsListHeaderContainer, RevisionsListItemWrapper, RevisionsList, RevisionsListEmptyWrapper,
	RevisionsListEmptyContainer,
} from './revisionDetails.styles';

interface IRevisionDetails {
	containerId: string;
	revisions: IRevisions[];
}

export const RevisionDetails = ({ containerId, revisions }: IRevisionDetails): JSX.Element => {
	const { teamspace, project } = useParams();
	const selected = 0;
	const isSingle = revisions?.length === 1;

	useEffect(() => {
		ContainersActionsDispatchers.fetchRevisions(teamspace, project, containerId);
	}, []);

	if (!revisions) {
		return null;
	}

	if (revisions.length === 0) {
		return (
			<RevisionsListEmptyWrapper>
				<RevisionsListEmptyContainer>
					<DashboardListEmptyText>
						<Trans id="containers.revisions.emptyMessage" message="You haven’t added any Files." />
					</DashboardListEmptyText>
					<NewContainerButton startIcon={<AddCircleIcon />}>
						<Trans id="containers.revisions.uploadFile" message="Upload File" />
					</NewContainerButton>
				</RevisionsListEmptyContainer>
			</RevisionsListEmptyWrapper>
		);
	}

	return (
		<Container>
			<RevisionsListHeaderContainer>
				<RevisionsListHeaderLabel width={130}><Trans id="revisionDetails.addedOn" message="Added on" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel width={228}><Trans id="revisionDetails.addedBy" message="Added by" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel width={330}><Trans id="revisionDetails.revisionCode" message="Revision code" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel><Trans id="revisionDetails.description" message="Description" /></RevisionsListHeaderLabel>
			</RevisionsListHeaderContainer>
			<RevisionsList>
				{revisions.map((revision, i) => (
					<RevisionsListItemWrapper
						isSingle={isSingle}
						isBeforeSelected={i === selected - 1}
						selected={i === selected}
					>
						<RevisionsListItem revision={revision} selected={i === selected} />
					</RevisionsListItemWrapper>
				))}
			</RevisionsList>
		</Container>
	);
};
