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

import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { range } from 'lodash';

import { RevisionsListHeaderLabel } from '@components/shared/revisionDetails/components/revisionsListHeaderLabel';
import { IRevision } from '@/v5/store/revisions/revisions.types';
import { DashboardListEmptyText } from '@components/dashboard/dashboardList/dasboardList.styles';
import { Button } from '@controls/button';
import AddCircleIcon from '@assets/icons/add_circle.svg';
import { RevisionsListItem } from '@components/shared/revisionDetails/components/revisionsListItem';
import { SkeletonListItem } from '@components/shared/revisionDetails/components/skeletonListItem';
import { RevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers/revisionsActions.dispatchers';
import { RevisionsHooksSelectors } from '@/v5/services/selectorsHooks/revisionsSelectors.hooks';
import { FormattedMessage } from 'react-intl';
import {
	Container, RevisionsListHeaderContainer, RevisionsListItemWrapper, RevisionsList, RevisionsListEmptyWrapper,
	RevisionsListEmptyContainer,
} from './revisionDetails.styles';

interface IRevisionDetails {
	containerId: string;
	revisionsCount?: number;
}

export const RevisionDetails = ({ containerId, revisionsCount = 1 }: IRevisionDetails): JSX.Element => {
	const { teamspace, project } = useParams();
	const isLoading: boolean = RevisionsHooksSelectors.selectIsPending(containerId);
	const revisions: IRevision[] = RevisionsHooksSelectors.selectRevisions(containerId);
	const selected = revisions.findIndex((r) => !r.void);
	const isSingle = revisions?.length === 1;

	useEffect(() => {
		if (!revisions.length) {
			RevisionsActionsDispatchers.fetch(teamspace, project, containerId);
		}
	}, []);

	if (!isLoading && revisions && revisions.length === 0) {
		return (
			<RevisionsListEmptyWrapper>
				<RevisionsListEmptyContainer>
					<DashboardListEmptyText>
						<FormattedMessage id="containers.revisions.emptyMessage" defaultMessage="You haven’t added any Files." />
					</DashboardListEmptyText>
					<Button
						startIcon={<AddCircleIcon />}
						variant="contained"
						color="primary"
					>
						<FormattedMessage id="containers.revisions.uploadFile" defaultMessage="Upload File" />
					</Button>
				</RevisionsListEmptyContainer>
			</RevisionsListEmptyWrapper>
		);
	}

	return (
		<Container>
			<RevisionsListHeaderContainer>
				<RevisionsListHeaderLabel width={130}><FormattedMessage id="revisionDetails.addedOn" defaultMessage="Added on" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel width={228}><FormattedMessage id="revisionDetails.addedBy" defaultMessage="Added by" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel width={330}><FormattedMessage id="revisionDetails.revisionCode" defaultMessage="Revision code" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel><FormattedMessage id="revisionDetails.description" defaultMessage="Description" /></RevisionsListHeaderLabel>
			</RevisionsListHeaderContainer>
			<RevisionsList>
				{isLoading ? (
					range(revisionsCount).map((key) => <SkeletonListItem key={key} />)
				) : (
					revisions.map((revision, i) => (
						<RevisionsListItemWrapper
							isSingle={isSingle}
							isBeforeSelected={i === selected - 1}
							selected={i === selected}
							onClick={() => {}}
							key={revision._id}
						>
							<RevisionsListItem
								revision={revision}
								containerId={containerId}
								active={i === selected}
							/>
						</RevisionsListItemWrapper>
					))
				)}
			</RevisionsList>
		</Container>
	);
};
