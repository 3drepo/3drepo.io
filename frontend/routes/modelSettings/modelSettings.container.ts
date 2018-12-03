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
import { connect } from '../../helpers/migration';
import { ModelActions, selectSettings, selectIsPending } from './../../modules/model';
import { ModelSettings } from './modelSettings.component';
import { selectCurrentTeamspace } from './../../modules/userManagement';

const mapStateToProps = createStructuredSelector({
	currentTeamspace: selectCurrentTeamspace,
	modelSettings: selectSettings,
	isSettingsLoading: selectIsPending
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	fetchModelSettings: ModelActions.fetchSettings,
	updateModelSettings: ModelActions.updateSettings
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ModelSettings);
