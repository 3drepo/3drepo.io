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
import { selectMeasureSlopeUnits } from '@/v4/modules/measurements';
import { selectCurrentUser } from '../../../../../../modules/currentUser';
import { DialogActions } from '../../../../../../modules/dialog';
import { selectJobsList, selectMyJob } from '../../../../../../modules/jobs';
import { selectSettings, selectUnit } from '../../../../../../modules/model';
import {
	selectActiveRiskComments,
	selectActiveRiskDetails,
	selectAssociatedActivities,
	selectExpandDetails,
	selectFailedToLoad,
	selectFetchingDetailsIsPending,
	selectMeasureMode,
	selectMitigationCriteria,
	selectNewComment,
	selectPostCommentIsPending,
	selectRisks,
	RisksActions,
	selectFilteredRisks,
} from '../../../../../../modules/risks';
import {
	selectEndDate,
	selectSelectedStartingDate,
	selectSequences,
	selectStartDate,
	SequencesActions
} from '../../../../../../modules/sequences';
import { ViewpointsActions } from '../../../../../../modules/viewpoints';
import { withViewer } from '../../../../../../services/viewer/viewer';
import { RiskDetails } from './riskDetails.component';

const mapStateToProps = createStructuredSelector({
	criteria: selectMitigationCriteria,
	risk: selectActiveRiskDetails,
	comments: selectActiveRiskComments,
	jobs: selectJobsList,
	risks: selectRisks,
	filteredRisks: selectFilteredRisks,
	expandDetails: selectExpandDetails,
	fetchingDetailsIsPending: selectFetchingDetailsIsPending,
	newComment: selectNewComment,
	associatedActivities: selectAssociatedActivities,
	myJob: selectMyJob,
	currentUser: selectCurrentUser,
	modelSettings: selectSettings,
	failedToLoad: selectFailedToLoad,
	postCommentIsPending: selectPostCommentIsPending,
	minSequenceDate: selectStartDate,
	maxSequenceDate: selectEndDate,
	selectedDate: selectSelectedStartingDate,
	sequences: selectSequences,
	units: selectUnit,
	slopeUnit: selectMeasureSlopeUnits,
	measureMode: selectMeasureMode
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	setState: RisksActions.setComponentState,
	fetchRisk: RisksActions.fetchRisk,
	saveRisk: RisksActions.saveRisk,
	updateRisk: RisksActions.updateRisk,
	setActiveRisk: RisksActions.setActiveRisk,
	updateViewpoint: RisksActions.updateActiveRiskViewpoint,
	cloneRisk: RisksActions.cloneRisk,
	postComment: RisksActions.postComment,
	removeComment: RisksActions.removeComment,
	updateSelectedRiskPin: RisksActions.updateSelectedRiskPin,
	subscribeOnRiskCommentsChanges: RisksActions.subscribeOnRiskCommentsChanges,
	unsubscribeOnRiskCommentsChanges: RisksActions.unsubscribeOnRiskCommentsChanges,
	updateNewRisk: RisksActions.updateNewRisk,
	showScreenshotDialog: DialogActions.showScreenshotDialog,
	showConfirmDialog: DialogActions.showConfirmDialog,
	setCameraOnViewpoint: ViewpointsActions.showViewpoint,
	onRemoveResource: RisksActions.removeResource,
	attachFileResources: RisksActions.attachFileResources,
	attachLinkResources: RisksActions.attachLinkResources,
	showDialog: DialogActions.showDialog,
	showMitigationSuggestions: RisksActions.showMitigationSuggestions,
	showSequenceDate: SequencesActions.showSequenceDate,
	setMeasureMode: RisksActions.setMeasureMode,
	removeMeasurement: RisksActions.removeMeasurement,
	setMeasurementColor: RisksActions.setMeasurementColor,
	setMeasurementName: RisksActions.setMeasurementName,
}, dispatch);

export default withViewer(connect(mapStateToProps, mapDispatchToProps)(RiskDetails));
