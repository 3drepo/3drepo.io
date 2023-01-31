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

import { useEffect } from 'react';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ContainersHooksSelectors, ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';

export const useContainersData = () => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const containers = ContainersHooksSelectors.selectContainers();
	const favouriteContainers = ContainersHooksSelectors.selectFavouriteContainers();
	const isListPending = ContainersHooksSelectors.selectIsListPending();
	useEffect(() => {
		if (!teamspace || !project) return;
		ContainersActionsDispatchers.fetchContainers(teamspace, project);
	}, [project]);

	return { containers, favouriteContainers, isListPending };
};
