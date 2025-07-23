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

import { memo, useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
	DashboardListItemButton,
	DashboardListItemIcon,
	DashboardListItemRow,
	DashboardListItemText,
} from '@components/dashboard/dashboardList/dashboardListItem/components';
import { DashboardListItemContainerTitle } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemTitle';
import { FavouriteCheckbox } from '@controls/favouriteCheckbox';
import {
	enableRealtimeContainerRemoved,
	enableRealtimeContainerUpdateSettings,
} from '@/v5/services/realtime/container.events';
import { DashboardListItem } from '@components/dashboard/dashboardList';
import { IContainer } from '@/v5/store/containers/containers.types';
import {
	enableRealtimeContainerRevisionUpdate,
	enableRealtimeNewContainerRevisionUpdate,
} from '@/v5/services/realtime/containerRevision.events';
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { Display } from '@/v5/ui/themes/media';
import { formatDateTime } from '@/v5/helpers/intl.helper';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ContainerRevisionDetails } from '@components/shared/containerRevisionDetails/containerRevisionDetails.component';
import { ContainerEllipsisMenu } from './containerEllipsisMenu/containerEllipsisMenu.component';
import { IsMainList } from '../../mainList.context';

interface IContainerListItem {
	isSelected: boolean;
	container: IContainer;
	onSelectOrToggleItem: (id: string) => void;
}

export const ContainerListItem = memo(({
	isSelected,
	container,
	onSelectOrToggleItem,
}: IContainerListItem): JSX.Element => {
	const { teamspace, project } = useParams<DashboardParams>();
	const isMainList = useContext(IsMainList);

	useEffect(() => {
		if (isMainList) {
			return combineSubscriptions(
				enableRealtimeContainerRemoved(teamspace, project, container._id),
				enableRealtimeContainerUpdateSettings(teamspace, project, container._id),
				enableRealtimeContainerRevisionUpdate(teamspace, project, container._id),
				enableRealtimeNewContainerRevisionUpdate(teamspace, project, container._id),
			);
		}
	}, [container._id]);

	const onChangeFavourite = ({ currentTarget: { checked } }) => {
		if (checked) {
			ContainersActionsDispatchers.addFavourite(teamspace, project, container._id);
		} else {
			ContainersActionsDispatchers.removeFavourite(teamspace, project, container._id);
		}
	};

	return (
		<DashboardListItem
			selected={isSelected}
			key={container._id}
		>
			<DashboardListItemRow
				selected={isSelected}
				onClick={() => onSelectOrToggleItem(container._id)}
			>
				<DashboardListItemContainerTitle
					container={container}
					isSelected={isSelected}
				/>
				<DashboardListItemButton
					onClick={() => onSelectOrToggleItem(container._id)}
					width={186}
					hideWhenSmallerThan={Display.Desktop}
					tooltipTitle={
						<FormattedMessage id="containers.list.item.revisions.tooltip" defaultMessage="View revisions" />
					}
				>
					<FormattedMessage
						id="containers.list.item.revisions"
						defaultMessage="{count, plural, =0 {No revisions} one {# revision} other {# revisions}}"
						values={{ count: container.revisionsCount }}
					/>
				</DashboardListItemButton>
				<DashboardListItemText
					selected={isSelected}
					width={160}
				>
					{container.code}
				</DashboardListItemText>
				<DashboardListItemText
					width={188}
					hideWhenSmallerThan={Display.Tablet}
					selected={isSelected}
				>
					{container.type}
				</DashboardListItemText>
				<DashboardListItemText
					width={113}
					selected={isSelected}
					dontHighlight
				>
					{container.lastUpdated && formatDateTime(container.lastUpdated)}
				</DashboardListItemText>
				<DashboardListItemIcon>
					<FavouriteCheckbox
						checked={container.isFavourite}
						selected={isSelected}
						onChange={onChangeFavourite}
					/>
				</DashboardListItemIcon>
				<DashboardListItemIcon selected={isSelected}>
					<ContainerEllipsisMenu
						selected={isSelected}
						container={container}
						onSelectOrToggleItem={onSelectOrToggleItem}
					/>
				</DashboardListItemIcon>
			</DashboardListItemRow>
			{isSelected && (
				<ContainerRevisionDetails
					containerId={container._id}
					revisionsCount={container.revisionsCount}
					status={container.status}
				/>
			)}
		</DashboardListItem>
	);
});
