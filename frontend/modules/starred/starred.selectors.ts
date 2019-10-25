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
import { getStarredModelKey } from './starred.contants';

export const selectStarredDomain = (state) => ({...state.starred});

export const selectStarredMeta = createSelector(
	selectStarredDomain, (state) => state.starredMetaMap
);

export const selectStarredModels = createSelector(
	selectStarredDomain, (state) => state.starredModelsMap
);

const selectModelKey = (state, ownProps = {} as any) => {
	return getStarredModelKey(ownProps);
};

export const selectIsStarredModel = createSelector(
	selectStarredModels, selectModelKey, (starredModelsMap, modelKey) => {
		return !!starredModelsMap[modelKey];
	}
);
