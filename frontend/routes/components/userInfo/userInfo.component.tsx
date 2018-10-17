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
import { BrowserRouter as Router } from "react-router-dom";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

import { ListItemLink } './components/listItemLink/listItemLink.component';

import { StyledList } from './userInfo.styles';
import { Panel } from '../panel/panel.component';

const MENU_ITEMS = [
  {
    title: "Teamspaces",
    link: "teamspaces"
  },
  {
    title: "User Management",
    link: "user-management"
  },
  {
    title: "Profile",
    link: "profile"
  },
  {
    title: "Billing",
    link: "billing"
  }
];

interface IProps {
	loading: boolean;
	hasAvatar: boolean;
	account: any;
	itemToShow: any;
	firstName: string;
	lastName: string;
	username: string;
	email: string;
}

const UserInfo = ({ loading, account, hasAvatar, itemToShow, firstName, lastName, username, email }: IProps) => {
	const renderItems = items =>
		items.map(item => <ListItemLink to={`${username}/page=${item.link}`} key={item.title} title={item.title} />);

	return <>
      <Panel title={username}>
        {loading && "Loading..."}
				<Router>
					<StyledList>
						<ListItem>
							{!loading && `${firstName} ${lastName}`}
							{!loading && email}
						</ListItem>
						{renderItems(MENU_ITEMS)}
					</StyledList>
				</Router>
      </Panel>
    </>;
};

export default UserInfo;