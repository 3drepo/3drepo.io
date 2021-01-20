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

import React from 'react';

import { Avatar } from '../avatar/avatar.component';
import { Panel } from '../panel/panel.component';
import { ListItemLink } from './components/listItemLink/listItemLink.component';
import { Container, LoadingText, StyledList, UserContainer, UserData, UserEmail, UserName } from './userInfo.styles';

interface IMenuItem {
	title: string;
	path: string;
}

interface IProps {
	items: IMenuItem[];
	loading: boolean;
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	avatarUrl: string;
}

const renderItems = (items) => items.map((item) => (
	<ListItemLink
		to={item.path}
		key={item.title}
		title={item.title}
	/>
));

const UserInfoComponent = (props: IProps) => {
	const { items, loading, firstName, lastName, username, email, avatarUrl } = props;
	const name = firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : username;
	return (
		<Container>
			<Panel title="Teamspaces">
				<StyledList>
					<UserContainer>
						<Avatar
							name={name}
							url={avatarUrl}
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
					{renderItems(items)}
				</StyledList>
			</Panel>
		</Container>
	);
};

export const UserInfo = UserInfoComponent;
