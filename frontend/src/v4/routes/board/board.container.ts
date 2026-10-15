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

import { selectIssuesEnabled } from '@/v5/store/teamspaces/teamspaces.selectors';
import {
	selectCards,
	selectFilterProp,
	selectIsPending,
	selectLanes,
	selectSearchEnabled,
	selectShowClosedIssues,
	BoardActions
} from '../../modules/board';
import { DialogActions } from '../../modules/dialog';
import {
	selectSelectedFilters as selectSelectedIssueFilters,
	IssuesActions,
	selectSortByField,
	selectSortOrder
} from '../../modules/issues';
import { selectJobsList } from '../../modules/jobs';
import { selectSettings, ModelActions } from '../../modules/model';
import { SnackbarActions } from '../../modules/snackbar';
import { selectTopicTypes } from '../../modules/teamspace';
import { selectModels, selectProjects, selectTeamspacesList } from '../../modules/teamspaces';
import { Board } from './board.component';

const mapStateToProps = createStructuredSelector({
	teamspaces: selectTeamspacesList,
	lanes: selectLanes,
	isPending: selectIsPending,
	filterProp: selectFilterProp,
	searchEnabled: selectSearchEnabled,
	topicTypes: selectTopicTypes,
	jobs: selectJobsList,
	selectedIssueFilters: selectSelectedIssueFilters,
	cards: selectCards,
	projectsMap: selectProjects,
	modelsMap: selectModels,
	showClosedIssues: selectShowClosedIssues,
	modelSettings: selectSettings,
	sortOrder: selectSortOrder,
	sortByField: selectSortByField,
	issuesEnabled: selectIssuesEnabled,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchData: BoardActions.fetchData,
	fetchCardData: BoardActions.fetchCardData,
	resetCardData: BoardActions.resetCardData,
	openCardDialog: BoardActions.openCardDialog,
	setFilterProp: BoardActions.setFilterProp,
	showDialog: DialogActions.showDialog,
	updateIssue: IssuesActions.updateBoardIssue,
	toggleSearchEnabled: BoardActions.toggleSearchEnabled,
	toggleClosedIssues: BoardActions.toggleClosedIssues,
	setFilters: BoardActions.setFilters,
	printItems: BoardActions.printItems,
	downloadItems: BoardActions.downloadItems,
	importBCF: IssuesActions.importBcf,
	exportBCF: IssuesActions.exportBcf,
	toggleSortOrder: BoardActions.toggleSortOrder,
	showSnackbar: SnackbarActions.show,
	subscribeOnIssueChanges: IssuesActions.subscribeOnIssueChanges,
	unsubscribeOnIssueChanges: IssuesActions.unsubscribeOnIssueChanges,
	resetModel: ModelActions.reset,
	resetIssues: IssuesActions.reset,
	setSortBy: BoardActions.setSortBy
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Board);
