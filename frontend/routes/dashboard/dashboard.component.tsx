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
import { Route, Switch, Redirect } from 'react-router-dom';

import Teamspaces from '../teamspaces/teamspaces.container';
import ModelSettings from '../modelSettings/modelSettings.container';
import UserManagement from '../userManagement/userManagement.container';
import Profile from '../profile/profile.container';
import Billing from '../billing/billing.container';
import { Container, Sidebar, Content } from './dashboard.styles';
import { UserInfo } from '../components/userInfo/userInfo.component';
import { ROUTES } from '../../constants/routes';

const MENU_ITEMS = [
	{
		title: 'Teamspaces',
		path: ROUTES.TEAMSPACES
	},
	{
		title: 'User Management',
		path: ROUTES.USER_MANAGEMENT_MAIN
	},
	{
		title: 'Profile',
		path: ROUTES.PROFILE
	},
	{
		title: 'Billing',
		path: ROUTES.BILLING
	}
];

interface IProps {
	match: any;
	isPending: boolean;
	isInitialised: boolean;
	isAvatarPending: boolean;
	currentUser: any;
	fetchUser: (username) => void;
	push: (path) => void;
}

export class Dashboard extends React.PureComponent<IProps, any> {
	public componentDidMount() {
		this.props.fetchUser(this.props.currentUser.username);
	}

	public renderRoutes = (match, currentUser) => (
		<Switch>
			<Route
				exact
				path={ROUTES.TEAMSPACES}
				component={Teamspaces}
			/>
			<Route
				exact
				path={ROUTES.MODEL_SETTINGS}
				component={ModelSettings}
			/>
			<Route
				path={ROUTES.USER_MANAGEMENT_TEAMSPACE}
				component={UserManagement}
			/>
			<Route
				exact
				path={ROUTES.PROFILE}
				component={Profile}
			/>
			<Route
				path={ROUTES.BILLING}
				component={Billing}
			/>
			<Redirect exact from={match.url} to={ROUTES.TEAMSPACES} />
			<Redirect
				exact
				from={ROUTES.USER_MANAGEMENT_MAIN}
				to={`${ROUTES.USER_MANAGEMENT_MAIN}/${currentUser.username}`}
			/>
		</Switch>
	)

	public render() {
		const { match, currentUser, isPending, isInitialised, isAvatarPending } = this.props;
		return (
			<Container
				container={true}
				direction="row"
				justify="space-between"
				alignContent="flex-start"
			>
				<Sidebar>
					<UserInfo
						{...currentUser}
						loading={!isInitialised && (isPending || isAvatarPending)}
						items={MENU_ITEMS}
					/>
				</Sidebar>
				<Content>
					{this.renderRoutes(match, this.props.currentUser)}
				</Content>
			</Container>
		);
	}
}
