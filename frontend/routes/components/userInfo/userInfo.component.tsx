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
import { BrowserRouter as Router, withRouter } from 'react-router-dom';

import { ListItemLink } from './components/listItemLink/listItemLink.component';
import { Avatar } from './components/avatar/avatar.component';
import { Container, UserContainer, UserData, UserName, UserEmail, StyledList, LoadingText } from './userInfo.styles';
import { Panel } from '../panel/panel.component';

interface IMenuItem {
	title: string;
	path: string;
}

interface IProps {
	match: any;
	items: IMenuItem[];
	loading: boolean;
	hasAvatar: boolean;
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	avatarUrl: string;
}

const renderItems = (items, match) => items.map((item) => (
	<ListItemLink
		to={`${match.url}${item.path}`}
		key={item.title}
		title={item.title}
	/>
));

const UserInfoComponent = (props: IProps) => {
	const { match, items, loading, hasAvatar, firstName, lastName, username, email, avatarUrl } = props;

	return (
		<Router>
			<Container>
				<Panel title={username}>
						<StyledList>
							<UserContainer>
								<Avatar
									url={avatarUrl}
									altText={username}
									hasAvatar={hasAvatar}
									loading={loading}
								/>
								{ loading
									? <LoadingText>Loading...</LoadingText>
									: <UserData>
											<UserName>{firstName} {lastName}</UserName>
											<UserEmail>{email}</UserEmail>
										</UserData>
								}
							</UserContainer>
							{renderItems(items, match)}
						</StyledList>
				</Panel>
			</Container>
		</Router>
	);
};

export const UserInfo = withRouter(UserInfoComponent);
