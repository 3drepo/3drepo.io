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
import { selectJobsList, selectMyJob } from '../../../../../../modules/jobs';
import { ViewpointsActions } from '../../../../../../modules/viewpoints';
import { selectCurrentUser } from '../../../../../../modules/currentUser';
import {
	IssuesActions,
	selectActiveIssueDetails,
	selectExpandDetails,
	selectFetchingDetailsIsPending,
	selectNewComment,
	selectFailedToLoad
} from '../../../../../../modules/issues';
import { selectSettings, selectTopicTypes } from '../../../../../../modules/model';
import { IssueDetails } from './issueDetails.component';
import { DialogActions } from '../../../../../../modules/dialog';

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

export default connect(mapStateToProps, mapDispatchToProps)(IssueDetails);
