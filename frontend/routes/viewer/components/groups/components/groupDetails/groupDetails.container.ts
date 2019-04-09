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

import { connect } from '../../../../../../helpers/migration';
import { GroupDetails } from './groupDetails.component';
import {
	GroupsActions,
	selectActiveGroupDetails,
	selectExpandDetails,
	selectCriteriaFieldState
} from '../../../../../../modules/groups';
import { selectSettings, selectMetaKeys } from '../../../../../../modules/model';
import { selectCurrentUser } from '../../../../../../modules/currentUser';
import { selectSelectedNodes, selectTotalMeshes } from '../../../../../../modules/tree';

const mapStateToProps = createStructuredSelector({
	activeGroup: selectActiveGroupDetails,
	modelSettings: selectSettings,
	expandDetails: selectExpandDetails,
	currentUser: selectCurrentUser,
	totalMeshes: selectTotalMeshes,
	selectedNodes: selectSelectedNodes,
	fieldNames: selectMetaKeys,
	criteriaFieldState: selectCriteriaFieldState
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	setState: GroupsActions.setComponentState,
	updateGroup: GroupsActions.updateGroup,
	createGroup: GroupsActions.createGroup,
	setCriteriaState: GroupsActions.setCriteriaFieldState
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(GroupDetails);
