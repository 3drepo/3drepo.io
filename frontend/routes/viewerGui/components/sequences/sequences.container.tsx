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
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';

import { ActivitiesActions } from '../../../../modules/activities';
import { LegendActions } from '../../../../modules/legend';
import {
	selectActivitiesPending, selectCurrentActivities, selectEndDate, selectFrames, selectIsLoadingFrameState,
	selectSelectedEndingDate, selectSelectedFrameColors, selectSelectedSequence, selectSelectedStartingDate,
	selectSequences, selectStartDate, selectStepInterval, selectStepScale, SequencesActions,
} from '../../../../modules/sequences';
import { selectDraggablePanels, selectRightPanels, ViewerGuiActions } from '../../../../modules/viewerGui';
import { selectIsLoadingSequenceViewpoint, ViewpointsActions } from '../../../../modules/viewpoints';
import { Sequences } from './sequences.component';

const mapStateToProps = createStructuredSelector({
	sequences: selectSequences,
	startDate: selectStartDate,
	endDate: selectEndDate,
	frames: selectFrames,
	selectedDate: selectSelectedStartingDate,
	selectedEndingDate: selectSelectedEndingDate,
	colorOverrides: selectSelectedFrameColors,
	stepInterval: selectStepInterval,
	stepScale: selectStepScale,
	currentTasks: selectCurrentActivities,
	loadingFrameState: selectIsLoadingFrameState,
	loadingViewpoint: selectIsLoadingSequenceViewpoint,
	selectedSequence: selectSelectedSequence,
	rightPanels: selectRightPanels,
	draggablePanels: selectDraggablePanels,
	isActivitiesPending: selectActivitiesPending,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	setSelectedDate: SequencesActions.setSelectedDate,
	setStepInterval: SequencesActions.setStepInterval,
	setStepScale: SequencesActions.setStepScale,
	setSelectedSequence: SequencesActions.setSelectedSequence,
	toggleActivitiesPanel: ActivitiesActions.toggleActivitiesPanel,
	toggleLegend: LegendActions.togglePanel,
	resetLegendPanel: LegendActions.resetPanel,
	fetchActivityDetails: ActivitiesActions.fetchDetails,
	setPanelVisibility: ViewerGuiActions.setPanelVisibility,
	deselectViewsAndLeaveClipping: ViewpointsActions.deselectViewsAndLeaveClipping,
	setActiveViewpoint: ViewpointsActions.setActiveViewpoint,
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sequences));
