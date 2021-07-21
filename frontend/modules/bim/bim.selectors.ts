/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { get, sortBy } from 'lodash';
import { createSelector } from 'reselect';
import { prepareMetadata } from '../../helpers/bim';
import { searchByFilters } from '../../helpers/searching';

export const selectBimDomain = (state) => ({...state.bim});

export const selectMetadata = createSelector(
	selectBimDomain, (state) => sortBy(prepareMetadata(state.metadata), 'key')
);

export const selectIsPending = createSelector(
	selectBimDomain, (state) => state.isPending
);

export const selectComponentState = createSelector(
	selectBimDomain, (state) => state.componentState
);

export const selectIsActive = createSelector(
	selectBimDomain, (state) => state.isActive
);

export const selectActiveMeta = createSelector(
	selectBimDomain, (state) => state.activeMeta
);

export const selectShowStarred = createSelector(
	selectComponentState, (state) => state.showStarred
);

export const selectSelectedFilters = createSelector(
	selectComponentState, (state) => state.selectedFilters
);

export const selectSearchEnabled = createSelector(
	selectComponentState, (state) => state.searchEnabled
);

export const selectFilteredMetadata = createSelector(
	selectMetadata, selectSelectedFilters, (metadata, selectedFilters) => {
		return searchByFilters(metadata, selectedFilters, false, ['key', 'value']);
	}
);
