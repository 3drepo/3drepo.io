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
	RisksActions,
	selectActiveRiskDetails,
	selectExpandDetails,
	selectFetchingDetailsIsPending,
	selectNewComment,
	selectFailedToLoad,
	selectAssociatedActivities
} from '../../../../../../modules/risks';
import { selectSettings } from '../../../../../../modules/model';
import { RiskDetails } from './riskDetails.component';
import { DialogActions } from '../../../../../../modules/dialog';

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

export default connect(mapStateToProps, mapDispatchToProps)(RiskDetails);
