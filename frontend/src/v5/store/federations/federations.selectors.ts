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
import { isEmpty } from 'lodash';
import { IFederationsState } from '@/v5/store/federations/federations.types';
import { selectCurrentProject } from '@/v5/store/projects/projects.selectors';

const selectFederationsDomain = (state): IFederationsState => state.federations;

export const selectFederations = createSelector(
	selectFederationsDomain, selectCurrentProject,
	(state, currentProject) => state.federationsByProject[currentProject] ?? [],
);

export const selectFavouriteFederations = createSelector(
	selectFederations,
	(federations) => federations.filter(({ isFavourite }) => isFavourite),
);

export const selectHasFederations = createSelector(
	selectFederations, selectFavouriteFederations, (federations, favouriteFederations) => ({
		favourites: !isEmpty(favouriteFederations),
		all: !isEmpty(federations),
	}),
);

export const selectIsListPending = createSelector(
	selectFederationsDomain, selectCurrentProject,
	// Checks if the federations for the project have been fetched
	(state, currentProject) => !state.federationsByProject[currentProject],
);

export const selectAreStatsPending = createSelector(
	selectFederations, (federations) => federations.some(({ hasStatsPending }) => hasStatsPending),
);
