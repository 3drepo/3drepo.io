/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';

import {
	selectActiveNode,
	selectDataRevision,
	selectExpandedNodesMap,
	selectHiddenGeometryVisible,
	selectIsPending,
	selectNodesIndexesMap,
	selectSearchEnabled,
	selectSelectedFilters,
	selectSelectionMap,
	selectVisibilityMap,
	selectVisibleTreeNodesIds,
	selectVisibleTreeNodesList,
	TreeActions
} from '../../../../modules/tree';
import { Tree } from './tree.component';

const mapStateToProps = createStructuredSelector({
	searchEnabled: selectSearchEnabled,
	selectedFilters: selectSelectedFilters,
	hiddenGeometryVisible: selectHiddenGeometryVisible,
	nodesList: selectVisibleTreeNodesList,
	visibleNodesIds: selectVisibleTreeNodesIds,
	expandedNodesMap: selectExpandedNodesMap,
	nodesSelectionMap: selectSelectionMap,
	nodesVisibilityMap: selectVisibilityMap,
	nodesIndexesMap: selectNodesIndexesMap,
	isPending: selectIsPending,
	dataRevision: selectDataRevision,
	activeNode: selectActiveNode,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	showAllNodes: TreeActions.showAllNodes,
	isolateSelectedNodes: TreeActions.isolateSelectedNodes,
	showHiddenGeometry: TreeActions.showHiddenGeometry,
	setState: TreeActions.setComponentState,
	handleNodesClick: TreeActions.handleNodesClick,
	goToRootNode: TreeActions.goToRootNode,
	selectNodes: TreeActions.selectNodes,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Tree);
