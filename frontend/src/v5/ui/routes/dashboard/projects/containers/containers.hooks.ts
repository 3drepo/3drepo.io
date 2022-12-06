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
import { useParams } from 'react-router';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';

export const useContainersData = () => {
	const { teamspace, project } = useParams<DashboardParams>() as { teamspace: string, project: string };

	const containers = ContainersHooksSelectors.selectContainers();
	const favouriteContainers = ContainersHooksSelectors.selectFavouriteContainers();
	const isListPending = ContainersHooksSelectors.selectIsListPending();

	useEffect(() => {
		ContainersActionsDispatchers.fetchContainers(teamspace, project);
	}, [project]);

	return { containers, favouriteContainers, isListPending };
};
