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

import { DialogActions } from '../../../../modules/dialog';
import {
	selectActiveGroupDetails,
	selectActiveGroupId,
	selectColorOverrides,
	selectGroups,
	selectGroupsMap,
	selectHighlightedGroups,
	selectIsAllOverridden,
	selectIsPending,
	selectSearchEnabled,
	selectSelectedFilters,
	selectShowDetails,
	GroupsActions
} from '../../../../modules/groups';
import { selectSettings } from '../../../../modules/model';
import { selectIsModelLoaded } from '../../../../modules/viewerGui';
import { withViewer } from '../../../../services/viewer/viewer';
import { Groups } from './groups.component';

const mapStateToProps = createStructuredSelector({
	groups: selectGroups,
	groupsMap: selectGroupsMap,
	isPending: selectIsPending,
	activeGroupId: selectActiveGroupId,
	activeGroupDetails: selectActiveGroupDetails,
	showDetails: selectShowDetails,
	highlightedGroups: selectHighlightedGroups,
	searchEnabled: selectSearchEnabled,
	selectedFilters: selectSelectedFilters,
	colorOverrides: selectColorOverrides,
	modelSettings: selectSettings,
	isModelLoaded: selectIsModelLoaded,
	isAllOverridden: selectIsAllOverridden,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	setActiveGroup: GroupsActions.setActiveGroup,
	setState: GroupsActions.setComponentState,
	setNewGroup: GroupsActions.setNewGroup,
	showGroupDetails: GroupsActions.showDetails,
	closeDetails: GroupsActions.closeDetails,
	onFiltersChange: GroupsActions.onFiltersChange,
	toggleColorOverride: GroupsActions.toggleColorOverride,
	setOverrideAll: GroupsActions.setOverrideAll,
	deleteGroups: GroupsActions.deleteGroups,
	showConfirmDialog: DialogActions.showConfirmDialog,
	isolateGroup: GroupsActions.isolateGroup,
	downloadGroups: GroupsActions.downloadGroups,
	resetToSavedSelection: GroupsActions.resetToSavedSelection,
	resetActiveGroup: GroupsActions.resetActiveGroup,
	subscribeOnChanges: GroupsActions.subscribeOnChanges,
	unsubscribeFromChanges: GroupsActions.unsubscribeFromChanges,
}, dispatch);

export default withViewer(connect(mapStateToProps, mapDispatchToProps)(Groups));
