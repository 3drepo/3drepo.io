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

import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { TeamspacesHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Display } from '@/v5/ui/themes/media';
import { DashboardListItem } from '@components/dashboard/dashboardList';
import { DashboardListItemContainerTitle } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemTitle';
import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer';
import { SkeletonBlock } from '@controls/skeletonBlock/skeletonBlock.styles';
import { useEffect } from 'react';
import { DashboardListItemRow } from './editFederationContainersListItem.styles';

export const EditFederationContainersListItemLoading = ({ index, container }) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	
	useEffect( () => {
		ContainersActionsDispatchers.fetchContainerStats(teamspace, project, container._id);
	}, []);

	const delay = index / 10;
	return (

		<DashboardListItem >
			<DashboardListItemRow>
				<DashboardListItemContainerTitle
					minWidth={116}
					maxWidth={209}
					container={container}
					openInNewTab
				/>
				<FixedOrGrowContainer width={186} hideWhenSmallerThan={Display.Desktop} >
					<SkeletonBlock delay={delay} width="80%" />
				</FixedOrGrowContainer>
				<FixedOrGrowContainer width={160} >
					<SkeletonBlock delay={delay} width="80%" />
				</FixedOrGrowContainer>
				<FixedOrGrowContainer width={160} >
					<SkeletonBlock delay={delay} width="90%" />
				</FixedOrGrowContainer>
				<FixedOrGrowContainer width={160} hideWhenSmallerThan={Display.Tablet}>
					<SkeletonBlock delay={delay} width="90%" />
				</FixedOrGrowContainer>
				<FixedOrGrowContainer width={100}>
					<SkeletonBlock delay={delay} width="90%" />
				</FixedOrGrowContainer>
			</DashboardListItemRow>
		</DashboardListItem>
	);
};