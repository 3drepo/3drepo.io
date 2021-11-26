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
import { range } from 'lodash';

import { RevisionsListHeaderLabel } from '@components/shared/revisionDetails/components/revisionsListHeaderLabel';
import { IRevision } from '@/v5/store/revisions/revisions.types';
import { Button } from '@controls/button';
import ArrowUpCircleIcon from '@assets/icons/arrow_up_circle.svg';
import { RevisionsListItem } from '@components/shared/revisionDetails/components/revisionsListItem';
import { SkeletonListItem } from '@components/shared/revisionDetails/components/skeletonListItem';
import { RevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers/revisionsActions.dispatchers';
import { RevisionsHooksSelectors } from '@/v5/services/selectorsHooks/revisionsSelectors.hooks';
import { Display } from '@/v5/ui/themes/media';
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
					<RevisionsListEmptyText>
						<Trans id="containers.revisions.emptyMessage" message="You haven’t added any Files." />
					</RevisionsListEmptyText>
					<Button
						startIcon={<ArrowUpCircleIcon />}
						variant="contained"
						color="primary"
					>
						<Trans id="containers.revisions.uploadFile" message="Upload File" />
					</Button>
				</RevisionsListEmptyContainer>
			</RevisionsListEmptyWrapper>
		);
	}

	return (
		<Container>
			<RevisionsListHeaderContainer>
				<RevisionsListHeaderLabel width={130} tabletWidth={94}><Trans id="revisionDetails.addedOn" message="Added on" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel width={228} tabletWidth={155}><Trans id="revisionDetails.addedBy" message="Added by" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel tabletWidth={150}><Trans id="revisionDetails.revisionCode" message="Revision code" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel marginRight hideWhenSmallerThan={Display.Tablet}><Trans id="revisionDetails.description" message="Description" /></RevisionsListHeaderLabel>
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
