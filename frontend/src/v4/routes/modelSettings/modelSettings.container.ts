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

import { DialogActions } from '../../modules/dialog';
import { selectIsPending, selectSettings, ModelActions } from '../../modules/model';
import { selectCurrentTeamspace } from '../../modules/userManagement';
import { selectSearchEnabled, ViewpointsActions } from '../../modules/viewpoints';
import { ModelSettings } from './modelSettings.component';

const mapStateToProps = createStructuredSelector({
	currentTeamspace: selectCurrentTeamspace,
	modelSettings: selectSettings,
	isSettingsLoading: selectIsPending,
	searchEnabled: selectSearchEnabled,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchModelSettings: ModelActions.fetchSettings,
	updateModelSettings: ModelActions.updateSettings,
	showDialog: DialogActions.showDialog,
	setState: ViewpointsActions.setComponentState,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ModelSettings);
