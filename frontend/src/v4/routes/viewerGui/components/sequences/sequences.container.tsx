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

import { ViewpointsActions } from '@/v4/modules/viewpoints';
import { selectCurrentModelTeamspace } from '@/v4/modules/model/model.selectors';
import { ActivitiesActions } from '../../../../modules/activities';
import { LegendActions } from '../../../../modules/legend';
import {
	selectActivitiesPending, selectCurrentActivities, selectEndDate, selectFrames,
	selectFramePending, selectSelectedDate, selectSelectedEndingDate,
	selectSelectedSequence, selectSelectedStartingDate, selectSequences,
	selectStartDate, selectStepInterval, selectStepScale, SequencesActions,
	selectSelectedFrameViewpoint,
	selectSequenceModel,
} from '../../../../modules/sequences';
import { selectDraggablePanels, selectRightPanels, ViewerGuiActions } from '../../../../modules/viewerGui';
import { Sequences } from './sequences.component';

const mapStateToProps = createStructuredSelector({
	sequences: selectSequences,
	startDate: selectStartDate,
	endDate: selectEndDate,
	frames: selectFrames,
	selectedDate: selectSelectedDate,
	selectedStartDate: selectSelectedStartingDate,
	selectedEndingDate: selectSelectedEndingDate,
	stepInterval: selectStepInterval,
	stepScale: selectStepScale,
	currentTasks: selectCurrentActivities,
	loadingFrame: selectFramePending,
	selectedSequence: selectSelectedSequence,
	rightPanels: selectRightPanels,
	draggablePanels: selectDraggablePanels,
	isActivitiesPending: selectActivitiesPending,
	viewpoint: selectSelectedFrameViewpoint,
	teamspace: selectCurrentModelTeamspace,
	model: selectSequenceModel,
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
	clearTransformations: ViewpointsActions.clearTransformations,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Sequences);
