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
import { selectCurrentActivities, selectIsLoadingFrame, selectMaxDate, selectMinDate,
	selectSelectedDate, selectSelectedFrameColors, selectSelectedMinDate,
	selectSelectedSequence, selectSequences, selectStepInterval, selectStepScale,
	SequencesActions } from '../../../../modules/sequences';

import { Sequences } from './sequences.component';

const mapStateToProps = createStructuredSelector({
	sequences: selectSequences,
	minDate: selectMinDate,
	maxDate: selectMaxDate,
	selectedDate: selectSelectedDate,
	selectedMinDate: selectSelectedMinDate,
	colorOverrides: selectSelectedFrameColors,
	stepInterval: selectStepInterval,
	stepScale: selectStepScale,
	currentTasks: selectCurrentActivities,
	loadingFrame: selectIsLoadingFrame,
	selectedSequence: selectSelectedSequence
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	initializeSequences: SequencesActions.initializeSequences,
	setSelectedFrame: SequencesActions.setSelectedFrame,
	setStepInterval: SequencesActions.setStepInterval,
	setStepScale: SequencesActions.setStepScale,
	fetchFrame: SequencesActions.fetchFrame,
	setSelectedSequence: SequencesActions.setSelectedSequence,
	restoreIfcSpacesHidden: SequencesActions.restoreIfcSpacesHidden
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sequences));
