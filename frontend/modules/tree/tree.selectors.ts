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
import { calculateTotalMeshes } from '../../helpers/tree';

export const selectTreeDomain = (state) => Object.assign({}, state.tree);

export const selectSelectedNodes = createSelector(
	selectTreeDomain, (state) => state.selectedNodes
);

export const selectTotalMeshes = createSelector(
	selectTreeDomain, (state) => calculateTotalMeshes(state.selectedNodes)
);

export const selectComponentState = createSelector(
	selectTreeDomain, (state) => state.componentState
);

export const selectSelectedFilters = createSelector(
	selectComponentState, (state) => state.selectedFilters
);

export const selectSearchEnabled = createSelector(
	selectComponentState, (state) => state.searchEnabled
);

export const selectIfcSpacesHidden = createSelector(
	selectComponentState, (state) => state.ifcSpacesHidden
);

export const selectTreeNodesList = createSelector(
	selectComponentState, (state) => state.treeNodesList
);

export const selectExpandedNodesMap = createSelector(
	selectComponentState, (state) => state.expandedNodesMap
);

export const selectSelectedNodesMap = createSelector(
	selectComponentState, (state) => state.selectedNodesMap
);

export const selectHiddenNodesMap = createSelector(
	selectComponentState, (state) => state.hiddenNodesMap
);

export const selectNodesIndexesMap = createSelector(
	selectComponentState, (state) => state.nodesIndexesMap
);
