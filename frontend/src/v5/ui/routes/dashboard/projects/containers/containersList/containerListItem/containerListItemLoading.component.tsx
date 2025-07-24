/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { useEffect, type JSX } from 'react';
import { useParams } from 'react-router-dom';
import {
	DashboardListItemIcon,
	DashboardListItemRow,
} from '@components/dashboard/dashboardList/dashboardListItem/components';
import { DashboardListItemContainerTitle } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemTitle';
import { FavouriteCheckbox } from '@controls/favouriteCheckbox';

import { DashboardListItem } from '@components/dashboard/dashboardList';
import { IContainer } from '@/v5/store/containers/containers.types';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ContainerEllipsisMenu } from './containerEllipsisMenu/containerEllipsisMenu.component';
import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer/fixedOrGrowContainer.component';
import { SkeletonBlock } from '@controls/skeletonBlock/skeletonBlock.styles';
import { Display } from '@/v5/ui/themes/media';

interface IContainerListItem {
	container: IContainer;
	delay?: number;
}

export const ContainerListItemLoading = ({
	container,
	delay,
}: IContainerListItem): JSX.Element => {
	const { teamspace, project } = useParams<DashboardParams>();

	const onChangeFavourite = ({ currentTarget: { checked } }) => {
		if (checked) {
			ContainersActionsDispatchers.addFavourite(teamspace, project, container._id);
		} else {
			ContainersActionsDispatchers.removeFavourite(teamspace, project, container._id);
		}
	};

	useEffect( () => {
		ContainersActionsDispatchers.fetchContainerStats(teamspace, project, container._id);
	}, []);

	return (
		<DashboardListItem>
			<DashboardListItemRow>
				<DashboardListItemContainerTitle container={container} />
				<FixedOrGrowContainer width={186} hideWhenSmallerThan={Display.Desktop}>
					<SkeletonBlock delay={delay} width="90%" />
				</FixedOrGrowContainer>
				<FixedOrGrowContainer width={160}>
					<SkeletonBlock delay={delay} width="70%" />
				</FixedOrGrowContainer>
				<FixedOrGrowContainer width={188} hideWhenSmallerThan={Display.Tablet}>
					<SkeletonBlock delay={delay} width="60%" />
				</FixedOrGrowContainer>
				<FixedOrGrowContainer width={78}>
					<SkeletonBlock delay={delay} width="90%" />
				</FixedOrGrowContainer>
				<DashboardListItemIcon>
					<FavouriteCheckbox
						checked={container.isFavourite}
						onChange={onChangeFavourite}
					/>
				</DashboardListItemIcon>
				<DashboardListItemIcon >
					<ContainerEllipsisMenu container={container} />
				</DashboardListItemIcon>
			</DashboardListItemRow>
		</DashboardListItem>
	);
};
