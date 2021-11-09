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

import { createSelector } from 'reselect';
import { IContainersState } from '@/v5/store/containers/containers.types';
import { isEmpty } from 'lodash';
import { selectCurrentProject } from '@/v5/store/projects/projects.selectors';

const selectContainersDomain = (state: { containers: IContainersState }) => state.containers;

export const selectContainers = createSelector(
	selectContainersDomain, selectCurrentProject, (state, currentProject) => state.containers[currentProject] ?? [],
);

export const selectFilterQuery = createSelector(
	selectContainersDomain, (state) => state.filterQuery,
);

export const selectFilteredContainers = createSelector(
	selectContainers, selectFilterQuery,
	(containers, filterQuery) => containers.filter((
		{ name, code, type },
	) => [name, code, type].join('').toLowerCase().includes(filterQuery.trim().toLowerCase())),
);

export const selectFilteredFavouriteContainers = createSelector(
	selectFilteredContainers, (containers) => containers.filter(({ isFavourite }) => isFavourite),
);

export const selectHasContainers = createSelector(
	selectContainers, (containers) => ({
		favourites: containers.some(({ isFavourite }) => isFavourite),
		all: !isEmpty(containers),
	}),
);

export const selectIsListPending = createSelector(
	selectContainersDomain, (state) => state.isListPending,
);

export const selectAreStatsPending = createSelector(
	selectContainers, (containers) => containers.some(({ hasStatsPending }) => hasStatsPending),
);
