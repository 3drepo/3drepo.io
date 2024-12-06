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
	selectAreaMeasurements, selectEdgeSnapping, selectLengthMeasurements,
	selectMeasureMode, selectMeasureUnits, selectPointMeasurements, selectXyzDisplay, MeasurementsActions, selectAngleMeasurements, selectSlopeMeasurements
} from '../../../../modules/measurements';
import { selectUnit } from '../../../../modules/model';
import { withViewer } from '../../../../services/viewer/viewer';

import { Measurements } from './measurements.component';

const mapStateToProps = createStructuredSelector({
	areaMeasurements: selectAreaMeasurements,
	lengthMeasurements: selectLengthMeasurements,
	pointMeasurements: selectPointMeasurements,
	angleMeasurements: selectAngleMeasurements,
	slopeMeasurements: selectSlopeMeasurements,
	measureUnits: selectMeasureUnits,
	edgeSnappingEnabled: selectEdgeSnapping,
	XYZdisplay: selectXyzDisplay,
	modelUnit: selectUnit,
	measureMode: selectMeasureMode
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	setMeasureMode: MeasurementsActions.setMeasureMode,
	removeMeasurement: MeasurementsActions.removeMeasurement,
	clearMeasurements: MeasurementsActions.clearMeasurements,
	setMeasurementColor: MeasurementsActions.setMeasurementColor,
	resetMeasurementColors: MeasurementsActions.resetMeasurementColors,
	setMeasureUnits: MeasurementsActions.setMeasureUnits,
	setMeasureEdgeSnapping: MeasurementsActions.setMeasureEdgeSnapping,
	setMeasureXYZDisplay: MeasurementsActions.setMeasureXyzDisplay,
	setMeasurementName: MeasurementsActions.setMeasurementName,
	resetMeasurementTool: MeasurementsActions.resetMeasurementTool,
}, dispatch);

export default withViewer(connect(mapStateToProps, mapDispatchToProps)(Measurements));
