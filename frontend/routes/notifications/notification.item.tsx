
/**
 *  Copyright (C) 2018 3D Repo Ltd
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
import * as React from "react";
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

import Drawer from "@material-ui/core/Drawer";
import Icon from "@material-ui/core/Icon";
import { Button, Paper } from "@material-ui/core";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { theme } from "../../styles";

export interface INotification {
	_id: string;
	type: string;
	read: boolean;
}

export class NotificationItem extends React.PureComponent<INotification, any> {
	public state = {
		open: false
	};

	public render() {
		return (
			<ListItem>
					<Avatar>
						<Icon>assignment</Icon>
					</Avatar>
					<ListItemText primary="Assigned Issue" secondary="you have 1 issue assigned" />
			</ListItem>
		);
	}
}
