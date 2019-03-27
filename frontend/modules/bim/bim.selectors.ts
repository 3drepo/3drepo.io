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

import { createSelector } from 'reselect';
import { searchByFilters } from '../../helpers/searching';

export const selectBimDomain = (state) => Object.assign({}, state.bim);

export const selectMetadata = createSelector(
	selectBimDomain, (state) => state.metadata
);

export const selectIsPending = createSelector(
	selectBimDomain, (state) => state.isPending
);

export const selectComponentState = createSelector(
	selectBimDomain, (state) => state.componentState
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
