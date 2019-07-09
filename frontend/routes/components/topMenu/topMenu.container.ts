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
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { selectCurrentUser } from '../../../modules/currentUser';
import { AuthActions } from '../../../modules/auth';
import { DialogActions } from '../../../modules/dialog';
import { selectSettings, ViewerActions, selectIsFocusMode } from '../../../modules/viewer';
import { TopMenu } from './topMenu.component';

const mapStateToProps = createStructuredSelector({
	currentUser: selectCurrentUser,
	visualSettings: selectSettings,
	isFocusMode: selectIsFocusMode
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	onLogout: AuthActions.logout,
	showDialog: DialogActions.showDialog,
	updateSettings: ViewerActions.updateSettings
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TopMenu));
