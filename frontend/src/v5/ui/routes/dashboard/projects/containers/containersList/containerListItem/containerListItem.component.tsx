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

import { useContext, useEffect, useState } from 'react';
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
	enableRealtimeNewRevisionUpdate,
} from '@/v5/services/realtime/revision.events';
import { RevisionDetails } from '@components/shared/revisionDetails';
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { Display } from '@/v5/ui/themes/media';
import { formatDate, formatMessage } from '@/v5/services/intl';
import { SkeletonListItem } from '@/v5/ui/routes/dashboard/projects/federations/federationsList/skeletonListItem';
import { prefixBaseDomain, viewerRoute } from '@/v5/services/routing/routing';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers/dialogsActions.dispatchers';
import { ContainerEllipsisMenu } from './containerEllipsisMenu/containerEllipsisMenu.component';
import { ContainerSettingsForm } from '../../containerSettingsForm/containerSettingsForm.component';
import { IsMainList } from '../../containers.component';

interface IContainerListItem {
	index: number;
	isSelected: boolean;
	container: IContainer;
	onFavouriteChange: (id: string, value: boolean) => void;
	onSelectOrToggleItem: (id: string) => void;
}

export const ContainerListItem = ({
	index,
	isSelected,
	container,
	onSelectOrToggleItem,
	onFavouriteChange,
}: IContainerListItem): JSX.Element => {
	if (container.hasStatsPending) {
		return <SkeletonListItem delay={index / 10} key={container._id} />;
	}
	const { teamspace, project } = useParams<DashboardParams>();
	const isMainList = useContext(IsMainList);

	useEffect(() => {
		if (isMainList) {
			return combineSubscriptions(
				enableRealtimeContainerRemoved(teamspace, project, container._id),
				enableRealtimeContainerUpdateSettings(teamspace, project, container._id),
				enableRealtimeContainerRevisionUpdate(teamspace, project, container._id),
				enableRealtimeNewRevisionUpdate(teamspace, project, container._id),
			);
		}
		return null;
	}, [container._id]);

	const [containerSettingsOpen, setContainerSettingsOpen] = useState(false);

	const onClickShare = () => {
		const link = prefixBaseDomain(viewerRoute(teamspace, project, container));
		const subject = formatMessage({ id: 'shareModal.container.subject', defaultMessage: 'container' });
		const title = formatMessage({ id: 'shareModal.container.title', defaultMessage: 'Share Container' });

		DialogsActionsDispatchers.open('share', {
			name: container.name,
			subject,
			title,
			link,
		});
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
						defaultMessage="{count} revisions"
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
					width={78}
					selected={isSelected}
				>
					{container.lastUpdated ? formatDate(container.lastUpdated) : ''}
				</DashboardListItemText>
				<DashboardListItemIcon>
					<FavouriteCheckbox
						checked={container.isFavourite}
						selected={isSelected}
						onChange={(event) => {
							onFavouriteChange(
								container._id,
								!!event.currentTarget.checked,
							);
						}}
					/>
				</DashboardListItemIcon>
				<DashboardListItemIcon selected={isSelected}>
					<ContainerEllipsisMenu
						selected={isSelected}
						container={container}
						onSelectOrToggleItem={onSelectOrToggleItem}
						openShareModal={onClickShare}
						openContainerSettings={() => setContainerSettingsOpen(true)}
					/>
				</DashboardListItemIcon>
			</DashboardListItemRow>
			{isSelected && (
				<RevisionDetails
					containerId={container._id}
					revisionsCount={container.revisionsCount}
					status={container.status}
				/>
			)}
			<ContainerSettingsForm
				open={containerSettingsOpen}
				container={container}
				onClose={() => setContainerSettingsOpen(false)}
			/>
		</DashboardListItem>
	);
};
