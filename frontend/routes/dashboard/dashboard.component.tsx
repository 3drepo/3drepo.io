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

import { Container, Sidebar, Content } from './dashboard.styles';
import { UserInfo } from '../components/userInfo/userInfo.component';
import UserManagement from '../userManagement/userManagement.container';
import Profile from '../profile/profile.container';

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
	currentUser: any;
	fetchUser: (username) => void;
}

export class Dashboard extends React.PureComponent<IProps, any> {
	public componentDidMount() {
		this.props.fetchUser(this.props.currentUser.username);
	}

	public render() {
		const { match, currentUser, isPending } = this.props;

		return (
			<Container
				container
				direction="row"
				justify="space-between"
				alignContent="flex-start"
			>
				<Sidebar>
					<UserInfo
						loading={isPending}
						// TODO: Handle this prop
						hasAvatar={true}
						{...currentUser}
						items={MENU_ITEMS}
					/>
				</Sidebar>
				<Content>
					<Switch>
						{/* <Route exact path={`${match.url}dashboard/teamspaces`} component={Teamspaces} /> */}
						<Route path={`${match.url}dashboard/user-management/:teamspace`} component={UserManagement} />
						<Route exact path={`${match.url}dashboard/:teamspace/profile`} component={Profile} />
						{/* <Route path={`${match.url}dashboard/billing`} component={Billing} /> */}
						<Redirect exact from={`${match.url}dashboard`} to="/dashboard/teamspaces" />
						<Redirect
							exact
							from={`${match.url}dashboard/user-management`}
							to={`${match.url}dashboard/user-management/${currentUser.username}`}
						/>

					</Switch>
				</Content>
			</Container>
		);
	}
}
