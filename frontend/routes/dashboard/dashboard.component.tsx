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

import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { ROUTES } from '../../constants/routes';
import Billing from '../billing/billing.container';
import Board from '../board/board.container';
import { UserInfo } from '../components/userInfo/userInfo.component';
import ModelSettings from '../modelSettings/modelSettings.container';
import Profile from '../profile/profile.container';
import Teamspaces from '../teamspaces/teamspaces.container';
import { TeamspaceSettings } from '../teamspaceSettings';
import UserManagement from '../userManagement/userManagement.container';
import { Container, Content, Sidebar } from './dashboard.styles';

const MENU_ITEMS = [
	{
		title: 'Models & Federations',
		path: ROUTES.TEAMSPACES
	},
	{
		title: 'Issues & Risks',
		path: ROUTES.BOARD_MAIN
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
				path={ROUTES.BOARD_SPECIFIC}
				component={Board}
			/>
			<Route
				exact
				path={ROUTES.TEAMSPACE_SETTINGS}
				component={TeamspaceSettings}
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
			<Redirect
				from={ROUTES.BOARD_MAIN}
				to={`${ROUTES.BOARD_MAIN}/issues/${currentUser.username}`}
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
				container
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
				<Route path={`${match.url}dashboard`} render={this.renderDashboardRoute} />
			</Container>
		);
	}
}
