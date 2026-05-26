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
import { selectMeasureSlopeUnits } from '@/v4/modules/measurements';
import { selectUsername } from '../../../../../../modules/currentUser';
import { DialogActions } from '../../../../../../modules/dialog';
import {
	selectActiveIssueComments,
	selectActiveIssueDetails,
	selectExpandDetails,
	selectFailedToLoad,
	selectFetchingDetailsIsPending,
	selectIssues,
	selectMeasureMode,
	selectNewComment,
	selectPostCommentIsPending,
	IssuesActions,
	selectFilteredIssues,
} from '../../../../../../modules/issues';
import { selectJobsList, selectMyJob } from '../../../../../../modules/jobs';
import { selectPermissions, selectUnit } from '../../../../../../modules/model';
import {
	selectEndDate,
	selectSelectedStartingDate,
	selectSequences,
	selectStartDate,
	SequencesActions
} from '../../../../../../modules/sequences';
import { selectTopicTypes } from '../../../../../../modules/teamspace';
import { ViewpointsActions } from '../../../../../../modules/viewpoints';
import { withViewer } from '../../../../../../services/viewer/viewer';
import { IssueDetails } from './issueDetails.component';

const mapStateToProps = createStructuredSelector({
	issue: selectActiveIssueDetails,
	comments: selectActiveIssueComments,
	jobs: selectJobsList,
	expandDetails: selectExpandDetails,
	fetchingDetailsIsPending: selectFetchingDetailsIsPending,
	newComment: selectNewComment,
	myJob: selectMyJob,
	currentUser: selectUsername,
	permissions: selectPermissions,
	topicTypes: selectTopicTypes,
	failedToLoad: selectFailedToLoad,
	postCommentIsPending: selectPostCommentIsPending,
	issues: selectIssues,
	filteredIssues: selectFilteredIssues,
	minSequenceDate: selectStartDate,
	maxSequenceDate: selectEndDate,
	selectedDate: selectSelectedStartingDate,
	sequences: selectSequences,
	units: selectUnit,
	slopeUnits: selectMeasureSlopeUnits,
	measureMode: selectMeasureMode,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	setState: IssuesActions.setComponentState,
	fetchIssue: IssuesActions.fetchIssue,
	saveIssue: IssuesActions.saveIssue,
	updateIssue: IssuesActions.updateActiveIssue,
	setActiveIssue: IssuesActions.setActiveIssue,
	updateViewpoint: IssuesActions.updateActiveIssueViewpoint,
	cloneIssue: IssuesActions.cloneIssue,
	postComment: IssuesActions.postComment,
	removeComment: IssuesActions.removeComment,
	updateSelectedIssuePin: IssuesActions.updateSelectedIssuePin,
	onRemoveResource: IssuesActions.removeResource,
	subscribeOnIssueCommentsChanges: IssuesActions.subscribeOnIssueCommentsChanges,
	unsubscribeOnIssueCommentsChanges: IssuesActions.unsubscribeOnIssueCommentsChanges,
	updateNewIssue: IssuesActions.updateNewIssue,
	attachFileResources: IssuesActions.attachFileResources,
	attachLinkResources: IssuesActions.attachLinkResources,
	showDialog: DialogActions.showDialog,
	showScreenshotDialog:  DialogActions.showScreenshotDialog,
	showConfirmDialog: DialogActions.showConfirmDialog,
	showViewpoint: ViewpointsActions.showViewpoint,
	showSequenceDate: SequencesActions.showSequenceDate,
	setMeasureMode: IssuesActions.setMeasureMode,
	removeMeasurement: IssuesActions.removeMeasurement,
	setMeasurementColor: IssuesActions.setMeasurementColor,
	setMeasurementName: IssuesActions.setMeasurementName,
}, dispatch);

export default withViewer(connect(mapStateToProps, mapDispatchToProps)(IssueDetails));
