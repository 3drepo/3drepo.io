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
import { selectJobsList, selectMyJob } from '../../../../../../modules/jobs';
import { selectSettings } from '../../../../../../modules/model';
import {
	selectActiveRiskDetails,
	selectAssociatedActivities,
	selectExpandDetails,
	selectFailedToLoad,
	selectFetchingDetailsIsPending,
	selectNewComment,
	RisksActions
} from '../../../../../../modules/risks';
import { ViewpointsActions } from '../../../../../../modules/viewpoints';
import { withViewer } from '../../../../../../services/viewer/viewer';
import { RiskDetails } from './riskDetails.component';

const mapStateToProps = createStructuredSelector({
	risk: selectActiveRiskDetails,
	jobs: selectJobsList,
	expandDetails: selectExpandDetails,
	fetchingDetailsIsPending: selectFetchingDetailsIsPending,
	newComment: selectNewComment,
	associatedActivities: selectAssociatedActivities,
	myJob: selectMyJob,
	currentUser: selectCurrentUser,
	modelSettings: selectSettings,
	failedToLoad: selectFailedToLoad
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	setState: RisksActions.setComponentState,
	fetchRisk: RisksActions.fetchRisk,
	saveRisk: RisksActions.saveRisk,
	updateRisk: RisksActions.updateRisk,
	postComment: RisksActions.postComment,
	removeComment: RisksActions.removeComment,
	showNewPin: RisksActions.showNewPin,
	subscribeOnRiskCommentsChanges: RisksActions.subscribeOnRiskCommentsChanges,
	unsubscribeOnRiskCommentsChanges: RisksActions.unsubscribeOnRiskCommentsChanges,
	updateNewRisk: RisksActions.updateNewRisk,
	showScreenshotDialog: DialogActions.showScreenshotDialog,
	setCameraOnViewpoint: ViewpointsActions.setCameraOnViewpoint
}, dispatch);

export default withViewer(connect(mapStateToProps, mapDispatchToProps)(RiskDetails));
