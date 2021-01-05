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
import { CompareActions } from '../../modules/compare';

import { selectCurrentUser } from '../../modules/currentUser';
import { MeasurementsActions } from '../../modules/measurements';
import { selectIsPending, selectSettings, ModelActions } from '../../modules/model';
import { selectIsPresentationActive } from '../../modules/presentation';
import { selectQueryParams } from '../../modules/router/router.selectors';
import { TreeActions } from '../../modules/tree';
import {
	selectDisabledPanelButtons,
	selectIsFocusMode, selectLeftPanels, selectRightPanels, ViewerGuiActions,
} from '../../modules/viewerGui';
import { withViewer } from '../../services/viewer/viewer';
import { ViewerGui } from './viewerGui.component';

const mapStateToProps = createStructuredSelector({
	queryParams: selectQueryParams,
	currentUser: selectCurrentUser,
	modelSettings: selectSettings,
	isModelPending: selectIsPending,
	leftPanels: selectLeftPanels,
	rightPanels: selectRightPanels,
	isFocusMode: selectIsFocusMode,
	disabledPanelButtons: selectDisabledPanelButtons,
	isPresentationActive: selectIsPresentationActive
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchData: ViewerGuiActions.fetchData,
	resetPanelsStates: ViewerGuiActions.resetPanelsStates,
	setPanelVisibility: ViewerGuiActions.setPanelVisibility,
	stopListenOnSelections: TreeActions.stopListenOnSelections,
	stopListenOnModelLoaded: ViewerGuiActions.stopListenOnModelLoaded,
	stopListenOnClickPin: ViewerGuiActions.stopListenOnClickPin,
	resetModel: ModelActions.reset,
	resetViewerGui: ViewerGuiActions.reset,
	removeMeasurement: MeasurementsActions.removeMeasurement,
	resetCompareComponent: CompareActions.resetComponentState
}, dispatch);

export default withViewer(connect(mapStateToProps, mapDispatchToProps)(ViewerGui));
