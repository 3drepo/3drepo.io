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
	selectIssues,
	selectIsImportingBCF,
	selectIsIssuesPending,
	selectSearchEnabled,
	selectSelectedFilters,
	selectShowDetails,
	selectShowPins,
	selectShowSubmodelIssues,
	selectSortOrder,
	IssuesActions
} from '../../../../modules/issues';
import { selectJobsList } from '../../../../modules/jobs';
import { selectSettings, selectTopicTypes } from '../../../../modules/model';
import { Issues } from './issues.component';

const mapStateToProps = createStructuredSelector({
	issues: selectIssues,
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
	topicTypes: selectTopicTypes
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchIssues: IssuesActions.fetchIssues,
	setState: IssuesActions.setComponentState,
	setNewIssue: IssuesActions.setNewIssue,
	downloadIssues: IssuesActions.downloadIssues,
	printIssues: IssuesActions.printIssues,
	setActiveIssue: IssuesActions.setActiveIssue,
	showIssueDetails: IssuesActions.showDetails,
	subscribeOnIssueChanges: IssuesActions.subscribeOnIssueChanges,
	unsubscribeOnIssueChanges: IssuesActions.unsubscribeOnIssueChanges,
	closeDetails: IssuesActions.closeDetails,
	toggleSubmodelsIssues: IssuesActions.toggleSubmodelsIssues,
	importBCF: IssuesActions.importBcf,
	exportBCF: IssuesActions.exportBcf,
	toggleSortOrder: IssuesActions.toggleSortOrder,
	setFilters: IssuesActions.setFilters,
	renderPins: IssuesActions.renderPins
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Issues);
