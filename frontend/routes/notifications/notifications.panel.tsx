
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
	sendUpdateNotificationRead: (id: string, read: boolean) => void;
	sendDeleteNotification: (id: string) => void;
}

export class NotificationsPanel extends React.PureComponent<IProps, any> {
	public notificationViewLink(notification: INotification) {
		return `${notification.teamSpace}/${notification.modelId}?notificationId=${notification._id}`;
	}

	public gotoNotification(notification: INotification) {
		location.href =  this.notificationViewLink(notification);
	}

	public render() {
		const {notifications, labelLeft, labelRight} = this.props;

		if (this.props.notifications.length === 0) {
			return (<></>);
		}

		const actions = {
			sendUpdateNotificationRead: this.props.sendUpdateNotificationRead ,
			sendDeleteNotification: this.props.sendDeleteNotification
		};

		return (<ListItem style={{paddingLeft: 10, paddingRight: 10, paddingTop: 0, paddingBottom: 0}}>
					<div style={{width: '100%', marginTop: 15}}>
						<div style={{display: 'flex', justifyContent: 'space-between', paddingLeft: 5, paddingRight: 5}}>
							<ItemLabel>
								{labelLeft}
							</ItemLabel>
							<ItemLabel>
								{labelRight}
							</ItemLabel>
						</div>
						<List style={{paddingBottom: 0}} > {notifications.map((notification) =>
								<NotificationItem key={notification._id}
								{...notification} {...actions }/>
							)}
						</List>
					</div>
				</ListItem>);
	}
}
