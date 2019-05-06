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
import { searchByFilters } from '../../helpers/searching';

export const selectTreeDomain = (state) => Object.assign({}, state.tree);

export const selectSelectedNodes = createSelector(
	selectTreeDomain, (state) => state.selectedNodes
);

export const selectTreeNodesList = createSelector(
	selectTreeDomain, (state) => state.treeNodesList
);

export const selectIsPending = createSelector(
	selectTreeDomain, (state) => state.isPending
);

export const selectTotalMeshes = createSelector(
	selectSelectedNodes, (selectedNodes) => calculateTotalMeshes(selectedNodes)
);

export const selectComponentState = createSelector(
	selectTreeDomain, (state) => state.componentState
);

export const selectSelectedFilters = createSelector(
	selectComponentState, (state) => state.selectedFilters
);

export const selectFilteredNodesList = createSelector(
	selectTreeNodesList, selectSelectedFilters, (nodes, selectedFilters) => {
		if (!selectedFilters.length) {
			return nodes;
		}
		return searchByFilters(nodes, selectedFilters, true);
	}
);

export const selectSearchEnabled = createSelector(
	selectComponentState, (state) => state.searchEnabled
);

export const selectIfcSpacesHidden = createSelector(
	selectComponentState, (state) => state.ifcSpacesHidden
);

export const selectExpandedNodesMap = createSelector(
	selectComponentState, (state) => state.expandedNodesMap
);

export const selectNodesSelectionMap = createSelector(
	selectComponentState, (state) => state.nodesSelectionMap
);

export const selectNodesVisibilityMap = createSelector(
	selectComponentState, (state) => state.nodesVisibilityMap
);

export const selectNodesIndexesMap = createSelector(
	selectComponentState, (state) => state.nodesIndexesMap
);

export const selectVisibleTreeNodesList = createSelector(
	[
		selectFilteredNodesList, selectNodesIndexesMap, selectSelectedFilters,
		selectExpandedNodesMap, selectSearchEnabled
	],
	(treeNodesList, nodesIndexesMap, selectedFilters, expandedNodesMap, searchEnabled) => {
		const visibleNodes = [];

		for (let index = 0; index < treeNodesList.length; index++) {
			const treeNode = treeNodesList[index];
			const isSearchActive = searchEnabled && selectedFilters.length;
			const isFirstLevel = treeNode.level === 1;
			const isSecondLevel = treeNode.level === 2;

			treeNode.parentIndex = nodesIndexesMap[treeNode.parentId];
			treeNode.isSearchResult = isSearchActive && !treeNode.isFederation && !treeNode.isModel;
			treeNode.isRegularNode = !isSearchActive && (isFirstLevel || isSecondLevel || expandedNodesMap[treeNode.parentId]);
			if (treeNode.isSearchResult || treeNode.isRegularNode) {
				visibleNodes.push(treeNode);
			}
		}

		return visibleNodes;
	}
);
