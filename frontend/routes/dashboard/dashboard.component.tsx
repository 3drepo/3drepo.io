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
import { RoutePlaceholder } from './components/routePlaceholder/routePlaceholder.component';

const MENU_ITEMS = [
	{
		title: 'Teamspaces',
		path: 'dashboard/teamspaces'
	},
	{
		title: 'User Management',
		path: 'dashboard/user-management'
	},
	{
		title: 'Profile',
		path: 'dashboard/profile'
	},
	{
		title: 'Billing',
		path: 'dashboard/billing'
	}
];

interface IProps {
	match: any;
	isPending: boolean;
	isInitialised: boolean;
	isAvatarPending: boolean;
	currentUser: any;
	fetchUser: (username) => void;
}

export class Dashboard extends React.PureComponent<IProps, any> {
	public componentDidMount() {
		this.props.fetchUser(this.props.currentUser.username);
	}

	public renderRoutes = (match, currentUser) => (
		<Switch>
			<Route
				exact={true}
				path={`${match.url}/teamspaces`}
				component={Teamspaces}
			/>
			<Route
				exact={true}
				path={`${match.url}/teamspaces/:teamspace/models/:modelId`}
				component={ModelSettings}
			/>
			<Route
				path={`${match.url}/user-management/:teamspace`}
				component={UserManagement}
			/>
			<Route
				exact={true}
				path={`${match.url}/profile`}
				component={Profile}
			/>
			<Route
				path={`${match.url}/billing`}
				component={Billing}
			/>
			<Redirect exact={true} from={match.url} to={`${match.url}/teamspaces`} />
			<Redirect
				exact={true}
				from={`${match.url}/user-management`}
				to={`${match.url}/user-management/${currentUser.username}`}
			/>
		</Switch>
	)

	public renderDashboardRoute = ({match}) => (
		<Content>
			{this.renderRoutes(match, this.props.currentUser)}
		</Content>
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
				<Route path={`${match.url}dashboard`} render={this.renderDashboardRoute} />
			</Container>
		);
	}
}
