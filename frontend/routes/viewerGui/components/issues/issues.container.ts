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

import {
	selectActiveIssueId,
	selectFetchingDetailsIsPending,
	selectFilteredIssues,
	selectIsImportingBCF,
	selectIsIssuesPending,
	selectSearchEnabled,
	selectSelectedFilters,
	selectSelectedIssue,
	selectShowDetails,
	selectShowPins,
	selectShowSubmodelIssues, selectSortByField, selectSortOrder, IssuesActions
} from '../../../../modules/issues';
import { selectJobsList } from '../../../../modules/jobs';
import { selectSettings } from '../../../../modules/model';
import { selectTopicTypes, TeamspaceActions } from '../../../../modules/teamspace';
import { Issues } from './issues.component';

const mapStateToProps = createStructuredSelector({
	issues: selectFilteredIssues,
	jobs: selectJobsList,
	activeIssueId: selectActiveIssueId,
	showDetails: selectShowDetails,
	showPins: selectShowPins,
	searchEnabled: selectSearchEnabled,
	selectedFilters: selectSelectedFilters,
	isPending: selectIsIssuesPending,
	fetchingDetailsIsPending: selectFetchingDetailsIsPending,
	modelSettings: selectSettings,
	showSubmodelIssues: selectShowSubmodelIssues,
	isImportingBCF: selectIsImportingBCF,
	sortOrder: selectSortOrder,
	topicTypes: selectTopicTypes,
	selectedIssue: selectSelectedIssue,
	sortByField: selectSortByField
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchIssues: IssuesActions.fetchIssues,
	setState: IssuesActions.setComponentState,
	setNewIssue: IssuesActions.setNewIssue,
	downloadItems: IssuesActions.downloadIssues,
	printItems: IssuesActions.printIssues,
	setActiveIssue: IssuesActions.setActiveIssue,
	showIssueDetails: IssuesActions.showDetails,
	goToIssue: IssuesActions.goToIssue,
	toggleShowPins: IssuesActions.toggleShowPins,
	closeDetails: IssuesActions.closeDetails,
	toggleSubmodelsIssues: IssuesActions.toggleSubmodelsIssues,
	importBCF: IssuesActions.importBcf,
	exportBCF: IssuesActions.exportBcf,
	toggleSortOrder: IssuesActions.toggleSortOrder,
	setFilters: IssuesActions.setFilters,
	setSortBy: IssuesActions.setSortBy,
	fetchSettings: TeamspaceActions.fetchSettings
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Issues);
