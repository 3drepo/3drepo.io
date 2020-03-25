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

import {
	selectAreaMeasurements, selectEdgeSnapping, selectIsMeasureActive, selectLengthMeasurements,
	selectMeasureMode, selectMeasureUnits, selectPointMeasurements, selectXyzDisplay, MeasureActions
} from '../../../../modules/measure';
import { withViewer } from '../../../../services/viewer/viewer';

import { Measure } from './measure.component';

const mapStateToProps = createStructuredSelector({
	isMeasureActive: selectIsMeasureActive,
	areaMeasurements: selectAreaMeasurements,
	lengthMeasurements: selectLengthMeasurements,
	pointMeasurements: selectPointMeasurements,
	measureMode: selectMeasureMode,
	measureUnits: selectMeasureUnits,
	edgeSnappingEnabled: selectEdgeSnapping,
	XYZdisplay: selectXyzDisplay,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	disableMeasure: MeasureActions.setDisabled,
	activateMeasure: MeasureActions.activateMeasure,
	deactivateMeasure: MeasureActions.deactivateMeasure,
	setMeasureMode: MeasureActions.setMeasureMode,
	removeMeasurement: MeasureActions.removeMeasurement,
	clearMeasurements: MeasureActions.clearMeasurements,
	addMeasurement: MeasureActions.addMeasurement,
	setMeasurementColor: MeasureActions.setMeasurementColor,
	resetMeasurementColors: MeasureActions.resetMeasurementColors,
	setMeasureUnits: MeasureActions.setMeasureUnits,
	setMeasureEdgeSnapping: MeasureActions.setMeasureEdgeSnapping,
	setMeasureXYZDisplay: MeasureActions.setMeasureXyzDisplay,
	setMeasurementCheck: MeasureActions.setMeasurementCheck,
	setMeasurementCheckAll: MeasureActions.setMeasurementCheckAll,
	setMeasurementName: MeasureActions.setMeasurementName,
	resetMeasurementTool: MeasureActions.resetMeasurementTool,
}, dispatch);

export default withViewer(connect(mapStateToProps, mapDispatchToProps)(Measure));
