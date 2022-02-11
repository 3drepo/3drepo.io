/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import React, { ComponentType } from 'react';
import { IContainer } from '@/v5/store/containers/containers.types';
import { DashboardListItemButton, DashboardListItemIcon, DashboardListItemText, DashboardListItemTitle } from '@components/dashboard/dashboardList/dashboardListItem/components';
import { LatestRevision } from '@/v5/ui/routes/dashboard/projects/containers/containersList/latestRevision';
import { Highlight } from '@controls/highlight';
import { RevisionDetails } from '@components/shared/revisionDetails';
import { Display } from '@/v5/ui/themes/media';
import { formatDate } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { SkeletonListItem } from '@components/shared/revisionDetails/components/skeletonListItem';
import { DashboardListItem } from '@components/dashboard/dashboardList';
import { DashboardListItemRow } from './editFederationContainersListItem.styles';

type EditFederationContainersListItemProps = {
	index: number;
	isSelected: boolean;
	container: IContainer;
	filterQuery?: string;
	icon: ComponentType
	onSelectOrToggleItem: (id: string) => void;
};

export const EditFederationContainersListItem = ({
	index,
	icon: Icon,
	isSelected,
	container,
	filterQuery,
	onSelectOrToggleItem,
}: EditFederationContainersListItemProps) => {
	if (container.hasStatsPending) {
		return <SkeletonListItem delay={index / 10} key={container._id} />;
	}
	return (
		<DashboardListItem
			selected={isSelected}
			key={container._id}
		>
			<DashboardListItemRow
				selected={isSelected}
				onClick={() => onSelectOrToggleItem(container._id)}
			>
				<DashboardListItemIcon
					width={46}
					minWidth={46}
				>
					<Icon />
				</DashboardListItemIcon>
				<DashboardListItemTitle
					minWidth={116}
					subtitle={(
						<LatestRevision
							name={container.latestRevision}
							status={container.status}
							error={container.errorResponse}
							hasRevisions={container.revisionsCount > 0}
						/>
					)}
					selected={isSelected}
					tooltipTitle={
						<FormattedMessage id="modal.editFederation.list.item.title.tooltip" defaultMessage="Launch latest revision" />
					}
				>
					<Highlight search={filterQuery}>
						{container.name}
					</Highlight>
				</DashboardListItemTitle>
				<DashboardListItemButton
					width={186}
					onClick={() => onSelectOrToggleItem(container._id)}
					hideWhenSmallerThan={Display.Desktop}
					tooltipTitle={
						<FormattedMessage id="modal.editFederation.list.item.revisions.tooltip" defaultMessage="View revisions" />
					}
				>
					<FormattedMessage
						id="modal.editFederation.list.item.revisions"
						defaultMessage="{count} revisions"
						values={{ count: container.revisionsCount }}
					/>
				</DashboardListItemButton>
				<DashboardListItemText
					width={160}
					selected={isSelected}
				>
					<Highlight search={filterQuery}>
						{container.code}
					</Highlight>
				</DashboardListItemText>
				<DashboardListItemText
					width={160}
					hideWhenSmallerThan={Display.Tablet}
					selected={isSelected}
				>
					<Highlight search={filterQuery}>
						{container.type}
					</Highlight>
				</DashboardListItemText>
				<DashboardListItemText
					width={188}
					selected={isSelected}
				>
					{container.lastUpdated ? formatDate(container.lastUpdated) : ''}
				</DashboardListItemText>
			</DashboardListItemRow>
			{isSelected && (
				<RevisionDetails
					containerId={container._id}
					revisionsCount={container.revisionsCount || 1}
				/>
			)}
		</DashboardListItem>
	);
};
