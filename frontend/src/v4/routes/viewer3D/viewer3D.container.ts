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

import { selectTicketPins } from '@/v5/store/tickets/card/ticketsCard.selectors';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';

import { selectGisLayers } from '../../modules/gis';
import { selectHighlightedShapes as selectIssuesHighlightedShapes,
	selectPins as selectIssuePins, selectShapes as selectIssuesShapes } from '../../modules/issues';
import { selectPins as selectMeasurementPins, selectAngleMeasurements, selectAreaMeasurements, selectLengthMeasurements } from '../../modules/measurements';
import { selectGISCoordinates, selectHasGISCoordinates } from '../../modules/model';
import { selectIsPaused, selectIsViewerManipulationEnabled, selectPresentationMode } from '../../modules/presentation';
import { selectHighlightedShapes as selectRisksHighlightedShapes,
	selectPins as selectRiskPins, selectShapes as selectRisksShapes  } from '../../modules/risks';
import { selectIsLoadingFrameState, selectSelectedHiddenNodes,
	selectSelectedSequenceId, SequencesActions } from '../../modules/sequences';
import { TreeActions } from '../../modules/tree';
import { selectAllTransparencyOverrides, selectColorOverrides, selectTransformations } from '../../modules/viewerGui';
import { withViewer } from '../../services/viewer/viewer';
import { Viewer3D } from './viewer3D.component';

const mapStateToProps = createStructuredSelector({
	colorOverrides: selectColorOverrides,
	transparencies: selectAllTransparencyOverrides,
	issuePins: selectIssuePins,
	riskPins: selectRiskPins,
	measurementPins: selectMeasurementPins,
	measurementsAngle: selectAngleMeasurements,
	measurementsArea: selectAreaMeasurements,
	measurementsLength: selectLengthMeasurements,
	gisCoordinates: selectGISCoordinates,
	hasGisCoordinates: selectHasGISCoordinates,
	gisLayers: selectGisLayers,
	viewerManipulationEnabled: selectIsViewerManipulationEnabled,
	presentationMode: selectPresentationMode,
	isPresentationPaused: selectIsPaused,
	transformations: selectTransformations,
	selectedSequenceId: selectSelectedSequenceId,
	isLoadingSequenceFrame: selectIsLoadingFrameState,
	sequenceHiddenNodes: selectSelectedHiddenNodes,
	issuesShapes: selectIssuesShapes,
	issuesHighlightedShapes: selectIssuesHighlightedShapes,
	risksShapes: selectRisksShapes,
	risksHighlightedShapes: selectRisksHighlightedShapes,
	ticketPins: selectTicketPins
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	handleTransparencyOverridesChange: TreeActions.handleTransparencyOverridesChange,
	handleTransparenciesVisibility: SequencesActions.handleTransparenciesVisibility
}, dispatch);

export default withViewer(connect(mapStateToProps, mapDispatchToProps)(Viewer3D));
