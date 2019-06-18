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

import * as React from 'react';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { Router, Route } from 'react-router-dom';
import { connect, history } from '../../helpers/migration';

import { App } from './app.component';
import { AuthActions, selectIsAuthenticated, selectActiveSession } from '../../modules/auth';
import { selectCurrentUser } from '../../modules/currentUser';
import { StartupActions } from '../../modules/startup/startup.redux';

const mapStateToProps = createStructuredSelector({
	isAuthenticated: selectIsAuthenticated,
	hasActiveSession: selectActiveSession,
	currentUser: selectCurrentUser
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	authenticate: AuthActions.authenticate,
	logout: AuthActions.logout,
	startup: StartupActions.startup
}, dispatch);

const AppWithStore = connect(mapStateToProps, mapDispatchToProps)(App);

const Root = () => (
	<Router history={history}>
		<Route path="/" component={AppWithStore} />
	</Router>
);

export default Root;
