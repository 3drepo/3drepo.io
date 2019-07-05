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
import { connect } from 'react-redux';

import { selectQueryParams } from '../../modules/router/router.selectors';
import { selectCurrentUser } from '../../modules/currentUser';
import { ViewerGui } from './viewerGui.component';
import { TreeActions } from '../../modules/tree';
import { ViewerActions, selectIsFocusMode } from '../../modules/viewer';
import { selectSettings, selectIsPending } from '../../modules/model';
import { ViewerGuiActions, selectVisiblePanels } from '../../modules/viewerGui';

const mapStateToProps = createStructuredSelector({
	queryParams: selectQueryParams,
	currentUser: selectCurrentUser,
	modelSettings: selectSettings,
	isModelPending: selectIsPending,
	visiblePanels: selectVisiblePanels,
	isFocusMode: selectIsFocusMode
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchData: ViewerGuiActions.fetchData,
	resetPanelsStates: ViewerGuiActions.resetPanelsStates,
	setPanelVisibility: ViewerGuiActions.setPanelVisibility,
	loadModel: ViewerActions.loadModel,
	stopListenOnSelections: TreeActions.stopListenOnSelections,
	stopListenOnModelLoaded: ViewerGuiActions.stopListenOnModelLoaded,
	stopListenOnClickPin: ViewerGuiActions.stopListenOnClickPin
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ViewerGui);
