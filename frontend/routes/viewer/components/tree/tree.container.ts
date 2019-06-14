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

import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { connect } from '../../../../helpers/migration';

import { Tree } from './tree.component';
import {
	TreeActions,
	selectIfcSpacesHidden,
	selectExpandedNodesMap,
	selectSelectedNodesMap,
	selectHiddenNodesMap,
	selectNodesIndexesMap,
	selectFilteredNodesList,
	selectSearchEnabled,
	selectSelectedFilters,
	selectIsPending
} from '../../../../modules/tree';

const mapStateToProps = createStructuredSelector({
	searchEnabled: selectSearchEnabled,
	selectedFilters: selectSelectedFilters,
	ifcSpacesHidden: selectIfcSpacesHidden,
	treeNodesList: selectFilteredNodesList,
	expandedNodesMap: selectExpandedNodesMap,
	selectedNodesMap: selectSelectedNodesMap,
	hiddenNodesMap: selectHiddenNodesMap,
	nodesIndexesMap: selectNodesIndexesMap,
	isPending: selectIsPending
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	showAllNodes: TreeActions.showAllNodes,
	isolateSelectedNodes: TreeActions.isolateSelectedNodes,
	hideIfcSpaces: TreeActions.hideIfcSpaces,
	setState: TreeActions.setComponentState,
	expandNode: TreeActions.expandNode,
	collapseNode: TreeActions.collapseNode,
	selectNode: TreeActions.selectNode,
	deselectNode: TreeActions.deselectNode
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Tree);
