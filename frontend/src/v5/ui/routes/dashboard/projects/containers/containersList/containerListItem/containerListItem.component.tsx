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
import { i18n } from '@lingui/core';
import { Trans } from '@lingui/react';
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
					/>
				)}
				selected={isSelected}
				tooltipTitle={
					<Trans id="containers.list.item.title.tooltip" message="Launch latest revision" />
				}
			>
				<Highlight search={filterQuery}>
					{container.name}
				</Highlight>
			</DashboardListItemTitle>
			<DashboardListItemButton
				onClick={() => {
					// eslint-disable-next-line no-console
					console.log('handle revisions button');
				}}
				width={186}
				tooltipTitle={
					<Trans id="containers.list.item.revisions.tooltip" message="View revisions" />
				}
			>
				<Trans
					id="containers.list.item.revisions"
					message="{count} revisions"
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
				{container.lastUpdated ? i18n.date(container.lastUpdated) : ''}
			</DashboardListItemText>
			<DashboardListItemIcon>
				<Tooltip
					title={
						<Trans id="containers.list.item.favourite.tooltip" message="Add to favourites" />
					}
				>
					<FavouriteCheckbox
						checked={container.isFavourite}
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
			<div style={{ backgroundColor: '#2E405F', width: '100%', height: '100px' }} />
		)}
	</DashboardListItem>
);
