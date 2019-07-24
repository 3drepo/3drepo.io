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

import { Groups } from './groups.component';
import {
	GroupsActions,
	selectGroups,
	selectIsPending,
	selectActiveGroupId,
	selectActiveGroupDetails,
	selectShowDetails,
	selectHighlightedGroups,
	selectSearchEnabled,
	selectSelectedFilters,
	selectColorOverrides,
	selectGroupsMap,
	selectIsAllOverridden
} from './../../../../modules/groups';
import { DialogActions } from '../../../../modules/dialog';
import { selectSettings } from '../../../../modules/model';

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
	isAllOverridden: selectIsAllOverridden
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
	unsubscribeFromChanges: GroupsActions.unsubscribeFromChanges
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Groups);
