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

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';

import { selectIsAuthenticated, AuthActions } from '../../../modules/auth';
import { selectCurrentUser, selectIsInitialised } from '../../../modules/currentUser';
import { DialogActions } from '../../../modules/dialog';
import { selectIsPresenting } from '../../../modules/presentation';
import { selectPathname } from '../../../modules/router/router.selectors';
import { selectSettings, ViewerActions } from '../../../modules/viewer';
import { selectIsFocusMode } from '../../../modules/viewerGui';
import { TopMenu } from './topMenu.component';

const mapStateToProps = createStructuredSelector({
	currentUser: selectCurrentUser,
	isInitialised: selectIsInitialised,
	visualSettings: selectSettings,
	isFocusMode: selectIsFocusMode,
	isAuthenticated: selectIsAuthenticated,
	isPresenting: selectIsPresenting,
	pathname: selectPathname,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	onLogout: AuthActions.logout,
	showDialog: DialogActions.showDialog,
	showConfirmDialog: DialogActions.showConfirmDialog,
	updateSettings: ViewerActions.updateSettings
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TopMenu));
