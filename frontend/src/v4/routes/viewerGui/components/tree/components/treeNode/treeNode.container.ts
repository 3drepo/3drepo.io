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

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';

import { selectSettings } from '../../../../../../modules/model';
import {
	selectDataRevision,
	selectSelectionMap,
	selectVisibilityMap,
	TreeActions
} from '../../../../../../modules/tree';
import { TreeNode } from './treeNode.component';

const mapStateToProps = createStructuredSelector({
	settings: selectSettings,
	visibilityMap: selectVisibilityMap,
	selectionMap: selectSelectionMap,
	rev: selectDataRevision
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	setState: TreeActions.setComponentState,
	expandNodes: TreeActions.expandNodes,
	collapseNodes: TreeActions.collapseNodes,
	setSelectedNodesVisibility: TreeActions.setSelectedNodesVisibility,
	isolateSelectedNodes: TreeActions.isolateSelectedNodes,
	zoomToHighlightedNodes: TreeActions.zoomToHighlightedNodes
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(TreeNode);
