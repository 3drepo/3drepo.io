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

import React from 'react';
import { Tooltip } from '@material-ui/core';
import {
	DashboardListItemButton,
	DashboardListItemIcon,
	DashboardListItemRow,
	DashboardListItemText,
	DashboardListItemTitle,
} from '@components/dashboard/dashboardList/dashboardListItem/components';
import { LatestRevision } from '@/v5/ui/routes/dashboard/projects/containers/containersList/latestRevision';
import { Highlight } from '@controls/highlight';
import { FavouriteCheckbox } from '@controls/favouriteCheckbox';
import { EllipsisButtonWithMenu } from '@controls/ellipsisButtonWithMenu';
import { getContainerMenuItems } from '@/v5/ui/routes/dashboard/projects/containers/containersList/containersList.helpers';
import { DashboardListItem } from '@components/dashboard/dashboardList';
import { IContainer } from '@/v5/store/containers/containers.types';
import { RevisionDetails } from '@components/shared/revisionDetails';
import { FormattedMessage } from 'react-intl';
import { formatDate } from '@/v5/services/intl';

interface IContainerListItem {
	isSelected: boolean;
	container: IContainer;
	filterQuery: string;
	onFavouriteChange: (id: string, value: boolean) => void;
	onToggleSelected: (id: string) => void;
}

export const ContainerListItem = ({
	isSelected,
	container,
	filterQuery,
	onToggleSelected,
	onFavouriteChange,
}: IContainerListItem): JSX.Element => (
	<DashboardListItem
		selected={isSelected}
		key={container._id}
	>
		<DashboardListItemRow
			selected={isSelected}
			onClick={() => onToggleSelected(container._id)}
		>
			<DashboardListItemTitle
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
					<FormattedMessage id="containers.list.item.title.tooltip" defaultMessage="Launch latest revision" />
				}
			>
				<Highlight search={filterQuery}>
					{container.name}
				</Highlight>
			</DashboardListItemTitle>
			<DashboardListItemButton
				onClick={() => onToggleSelected(container._id)}
				width={186}
				tooltipTitle={
					<FormattedMessage id="containers.list.item.revisions.tooltip" defaultMessage="View revisions" />
				}
			>
				<FormattedMessage
					id="containers.list.item.revisions"
					defaultMessage="{count} revisions"
					values={{ count: container.revisionsCount }}
				/>
			</DashboardListItemButton>
			<DashboardListItemText selected={isSelected}>
				<Highlight search={filterQuery}>
					{container.code}
				</Highlight>
			</DashboardListItemText>
			<DashboardListItemText width={188} selected={isSelected}>
				<Highlight search={filterQuery}>
					{container.type}
				</Highlight>
			</DashboardListItemText>
			<DashboardListItemText width={97} selected={isSelected}>
				{container.lastUpdated ? formatDate(container.lastUpdated) : ''}
			</DashboardListItemText>
			<DashboardListItemIcon>
				<Tooltip
					title={
						<FormattedMessage id="containers.list.item.favourite.tooltip" defaultMessage="Add to favourites" />
					}
				>
					<FavouriteCheckbox
						checked={container.isFavourite}
						selected={isSelected}
						onClick={(event) => {
							event.stopPropagation();
						}}
						onChange={(event) => {
							onFavouriteChange(
								container._id,
								!!event.currentTarget.checked,
							);
						}}
					/>
				</Tooltip>
			</DashboardListItemIcon>
			<DashboardListItemIcon selected={isSelected}>
				<EllipsisButtonWithMenu
					list={getContainerMenuItems(container._id)}
				/>
			</DashboardListItemIcon>
		</DashboardListItemRow>
		{isSelected && (
			<RevisionDetails
				containerId={container._id}
				revisionsCount={container.revisionsCount || 1}
			/>
		)}
	</DashboardListItem>
);
