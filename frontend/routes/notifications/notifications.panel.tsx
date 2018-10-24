
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
import {INotification, NotificationItem} from "./notification.item";
import { ListItem, List, Paper } from "@material-ui/core";
import { ItemLabel } from "../components/components.styles";

interface IProps {
	labelLeft?: string;
	labelRight?: string;
	notifications: INotification[];
	markNotificationAsRead: (id: string) => void;
}

export class NotificationsPanel extends React.PureComponent<IProps, any> {

	public render() {
		const {notifications, labelLeft, labelRight} = this.props;

		if (this.props.notifications.length === 0) {
			return (<></>);
		}

		return (<ListItem style={{paddingLeft: 10, paddingRight: 10}}>
					<div>
					<div style={{display: 'flex', justifyContent: 'space-between', paddingLeft: 5, paddingRight: 5}}>
						<ItemLabel>
							{labelLeft}
						</ItemLabel>
						<ItemLabel>
							{labelRight}
						</ItemLabel>
					</div>
					<List> {notifications.map((notification) =>
						<Paper style={{margin: 5}}  key={notification._id + labelRight}>
							<NotificationItem
							{...{...notification, markNotificationAsRead: this.props.markNotificationAsRead }}/>
						</Paper>
						)}
					</List>
					</div>
				</ListItem>);
	}
}
