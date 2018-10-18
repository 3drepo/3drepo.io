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

import { Container } from './dashboard.styles';
import { UserInfo } from '../components/userInfo/userInfo.component';

import UserManagement from '../userManagement/userManagement.container';
import Profile from '../profile/profile.container';

interface IProps {
	match: any;
	isPending: boolean;
	currentUser: any;
}

export class Dashboard extends React.PureComponent<IProps, any> {

	public render() {
		const { match, currentUser, isPending } = this.props;

		return (
			<Container>
				<UserInfo
					loading={isPending}
					// TODO: Handle this prop
					hasAvatar={true}
					{...currentUser}
				/>
				<Switch>
					{/* <Route exact path={`${match.url}/teamspaces`} component={Teamspaces} /> */}
					<Route exact path={`${match.url}/user-management`} component={UserManagement} />
					<Route exact path={`${match.url}/profile`} component={Profile} />
					{/* <Route exact path={`${match.url}/billing`} component={Billing} /> */}
					<Redirect exact from="/" to="/teamspaces" />
				</Switch>
			</Container>
		);
	}
}
