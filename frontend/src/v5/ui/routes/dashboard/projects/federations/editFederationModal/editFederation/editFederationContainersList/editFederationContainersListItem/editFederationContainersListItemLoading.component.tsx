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
import { SkeletonListItem } from '@components/shared/revisionDetails/components/skeletonListItem/skeletonListItem.component';
import { useEffect } from 'react';

export const EditFederationContainersListItemLoading = ({ index, container }) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	
	useEffect( () => {
		ContainersActionsDispatchers.fetchContainerStats(teamspace, project, container._id);
	}, []);


	return (<SkeletonListItem delay={index / 10} key={container._id} />);
};