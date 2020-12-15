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
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { selectCurrentTeamspace } from '../../modules/currentUser';
import { DialogActions } from '../../modules/dialog';
import { selectRevisions, ModelActions } from '../../modules/model';
import { selectStarredModels, StarredActions } from '../../modules/starred';
import {
	selectActiveSorting,
	selectActiveSortingDirection,
	selectDateSortingDescending,
	selectFlattenTeamspaces,
	selectIsPending,
	selectModels,
	selectModelCodes,
	selectNameSortingDescending,
	selectSearchEnabled,
	selectSelectedDataTypes,
	selectSelectedFilters,
	selectShowStarredOnly,
	selectStarredVisibleItems,
	selectTeamspaces,
	selectVisibleItems,
	TeamspacesActions
} from '../../modules/teamspaces';
import { Teamspaces } from './teamspaces.component';

const mapStateToProps = createStructuredSelector({
	currentTeamspace: selectCurrentTeamspace,
	items: selectFlattenTeamspaces,
	isPending: selectIsPending,
	visibleItems: selectVisibleItems,
	revisions: selectRevisions,
	starredVisibleItems: selectStarredVisibleItems,
	teamspaces: selectTeamspaces,
	showStarredOnly: selectShowStarredOnly,
	starredModelsMap: selectStarredModels,
	modelsMap: selectModels,
	searchEnabled: selectSearchEnabled,
	selectedFilters: selectSelectedFilters,
	selectedDataTypes: selectSelectedDataTypes,
	modelCodes: selectModelCodes,
	activeSorting: selectActiveSorting,
	activeSortingDirection: selectActiveSortingDirection,
	nameSortingDescending: selectNameSortingDescending,
	dateSortingDescending: selectDateSortingDescending,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	showDialog: DialogActions.showDialog,
	showConfirmDialog: DialogActions.showConfirmDialog,
	createProject: TeamspacesActions.createProject,
	updateProject: TeamspacesActions.updateProject,
	removeProject: TeamspacesActions.removeProject,
	createModel: TeamspacesActions.createModel,
	fetchTeamspaces: TeamspacesActions.fetchTeamspaces,
	setState: TeamspacesActions.setComponentState,
	downloadModel: ModelActions.downloadModel,
	fetchStarredModels: StarredActions.fetchStarredModels,
	leaveTeamspace:  TeamspacesActions.leaveTeamspace,
	subscribeOnChanges: TeamspacesActions.subscribeOnChanges,
	unsubscribeFromChanges: TeamspacesActions.unsubscribeFromChanges
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Teamspaces));
