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

import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { debounce } from 'lodash';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers/containersActions.dispatchers';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks/containersSelectors.hooks';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';

export const useContainersData = () => {
	const { teamspace, project } = useParams() as { teamspace: string, project: string };

	const filteredContainers = ContainersHooksSelectors.selectFilteredContainers();
	const favouriteContainers = ContainersHooksSelectors.selectFilteredFavouriteContainers();
	const hasContainers = ContainersHooksSelectors.selectHasContainers();
	const isListPending = ContainersHooksSelectors.selectIsListPending();
	const currentProject = ProjectsHooksSelectors.selectCurrentProject();

	useEffect(() => {
		if (hasContainers.all || currentProject !== project) return;

		ContainersActionsDispatchers.fetchContainers(teamspace, project);
	}, [currentProject]);

	return { filteredContainers, favouriteContainers, hasContainers, isListPending };
};

export const useContainersSearch = () => {
	const filterQuery = ContainersHooksSelectors.selectFilterQuery();

	const [searchInput, setSearchInput] = useState(filterQuery);

	const debounceSearchUpdate = debounce(
		(value: string) => ContainersActionsDispatchers.setFilterQuery(value),
		300,
		{ trailing: true },
	);

	useEffect(() => {
		debounceSearchUpdate(searchInput);
	}, [searchInput]);

	return { searchInput, setSearchInput, filterQuery };
};
