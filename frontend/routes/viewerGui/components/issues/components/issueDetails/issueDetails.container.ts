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
import { selectCurrentUser } from '../../../../../../modules/currentUser';
import { DialogActions } from '../../../../../../modules/dialog';
import {
	selectActiveIssueDetails,
	selectExpandDetails,
	selectFailedToLoad,
	selectFetchingDetailsIsPending,
	selectNewComment,
	IssuesActions
} from '../../../../../../modules/issues';
import { selectJobsList, selectMyJob } from '../../../../../../modules/jobs';
import { selectSettings, selectTopicTypes } from '../../../../../../modules/model';
import { ViewpointsActions } from '../../../../../../modules/viewpoints';
import { withViewer } from '../../../../../../services/viewer/viewer';
import { IssueDetails } from './issueDetails.component';

const mapStateToProps = createStructuredSelector({
	issue: selectActiveIssueDetails,
	jobs: selectJobsList,
	expandDetails: selectExpandDetails,
	fetchingDetailsIsPending: selectFetchingDetailsIsPending,
	newComment: selectNewComment,
	myJob: selectMyJob,
	currentUser: selectCurrentUser,
	settings: selectSettings,
	topicTypes: selectTopicTypes,
	failedToLoad: selectFailedToLoad
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	setState: IssuesActions.setComponentState,
	fetchIssue: IssuesActions.fetchIssue,
	saveIssue: IssuesActions.saveIssue,
	updateIssue: IssuesActions.updateIssue,
	postComment: IssuesActions.postComment,
	removeComment: IssuesActions.removeComment,
	showNewPin: IssuesActions.showNewPin,
	onRemoveResource: IssuesActions.removeResource,
	subscribeOnIssueCommentsChanges: IssuesActions.subscribeOnIssueCommentsChanges,
	unsubscribeOnIssueCommentsChanges: IssuesActions.unsubscribeOnIssueCommentsChanges,
	updateNewIssue: IssuesActions.updateNewIssue,
	attachFileResources: IssuesActions.attachFileResources,
	attachLinkResources: IssuesActions.attachLinkResources,
	showDialog:  DialogActions.showDialog,
	setCameraOnViewpoint: ViewpointsActions.setCameraOnViewpoint
}, dispatch);

export default withViewer(connect(mapStateToProps, mapDispatchToProps)(IssueDetails));
