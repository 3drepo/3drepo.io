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

import { memoize } from 'lodash';
import { PureComponent } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { PUBLIC_ROUTES, ROUTES } from '../../constants/routes';
import { getCookie, setCookie } from '../../helpers/cookies';
import { renderWhenTrue } from '../../helpers/rendering';
import { WebGLChecker } from '../../helpers/webglChecker';
import { clientConfigService } from '../../services/clientConfig';
import { isStaticRoute, STATIC_ROUTES } from '../../services/staticPages';
import { DialogContainer } from '../components/dialogContainer';
import { Intercom } from '../components/intercom';
import { PrivateRoute } from '../components/privateRoute';
import { SnackbarContainer } from '../components/snackbarContainer';
import StaticPageRoute from '../components/staticPageRoute/staticPageRoute.component';
import TopMenu from '../components/topMenu/topMenu.container';
import { Dashboard } from '../dashboard';
import { NotFound } from '../notFound';
import { PasswordChange } from '../passwordChange';
import { PasswordForgot } from '../passwordForgot';
import RegisterRequest from '../registerRequest/registerRequest.container';
import { RegisterVerify } from '../registerVerify';
import { Viewer3D } from '../viewer3D';
import { ViewerGui } from '../viewerGui';
import { AppContainer } from './app.styles';

interface IProps {
	location: any;
	history: any;
	isAuthenticated: boolean;
	currentUser: any;
	isAuthPending: boolean;
	showNewUpdateDialog: (config) => void;
	authenticate: () => void;
	logout: () => void;
	hideDialog: () => void;
	onLoggedOut: () => void;
	subscribeToDm: (event, handler) => void;
	showDialog: (config) => void;
	dialogs: any[];
}

interface IState {
	referrer?: string;
	autologoutInterval?: number;
}

const DEFAULT_REDIRECT = ROUTES.TEAMSPACES;

export class App extends PureComponent<IProps, IState> {

	get WebGLVersion() {
		return WebGLChecker();
	}

	public state = {
		referrer: DEFAULT_REDIRECT,
		autologoutInterval: clientConfigService.login_check_interval || 4
	};

	public renderStaticRoutes = memoize(() => STATIC_ROUTES.map(({ title, path, fileName }) => (
		<Route key={path} path={path} render={() => <StaticPageRoute title={title} fileName={fileName} />} />
	)));

	public renderHeader = renderWhenTrue(() => (
		<TopMenu />
	));

	constructor(props) {
		super(props);
	}

	public componentDidMount() {
		if (!PUBLIC_ROUTES.includes(location.pathname)) {
			this.props.authenticate();
		}

		this.props.subscribeToDm('loggedOut', this.props.onLoggedOut);
	}

	public componentDidUpdate(prevProps) {
		if (decodeURIComponent(location.pathname) !== decodeURIComponent(prevProps.location.pathname)) {
			if (this.props.dialogs.length) {
				this.props.hideDialog();
			}
		}

		if (!this.props.dialogs.length && this.props.isAuthenticated && this.WebGLVersion !== 2) {
			const { currentUser: { username }, showDialog } = this.props;
			const cookieName = `unsupportedViewerWarning_${username}`;
			const cookie = getCookie(cookieName);

			if (!cookie) {
				showDialog({
					title: `3D Repo Error`,
					content: `
						Your browser does not support WebGL 2.0 therefore the 3D Viewer will be unavailable.
						However, you can still other functionalities we offer.<br><br>
						To get the full experience, please update to the latest Chrome, Firefox or Edge.
					`,
					onCancel: () => setCookie(cookieName, true),
				});
			}
		}
	}

	public render() {
		return (
			<AppContainer>
				<Route component={Viewer3D} />
				{this.renderHeader(!isStaticRoute(location.pathname))}
				<Switch>
					<Route exact path={ROUTES.PASSWORD_FORGOT} component={PasswordForgot} />
					<Route exact path={ROUTES.PASSWORD_CHANGE} component={PasswordChange} />
					<Route exact path={ROUTES.REGISTER_REQUEST} component={RegisterRequest} />
					<Route exact path={ROUTES.REGISTER_VERIFY} component={RegisterVerify} />
					<Redirect exact from={ROUTES.HOME} to={ROUTES.TEAMSPACES} />
					<PrivateRoute path={ROUTES.DASHBOARD} component={Dashboard} />
					<PrivateRoute path={ROUTES.MODEL_VIEWER} component={ViewerGui} />
					{this.renderStaticRoutes()}
					<Route component={NotFound} />
				</Switch>
				<DialogContainer />
				<SnackbarContainer />
				<Intercom />
			</AppContainer>
		);
	}
}
