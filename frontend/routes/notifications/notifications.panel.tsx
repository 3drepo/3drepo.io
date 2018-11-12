
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
import { List } from '@material-ui/core';
import * as React from 'react';
import { INotification, NotificationItem } from './notification.item';
import { NotificationsPanelHeader } from './notifications.panel.header';
import { NotificationsPanelItem } from './notifications.styles';

interface IProps {
	labelLeft?: string;
	labelRight?: string;
	notifications: INotification[];
	sendUpdateNotificationRead: (id: string, read: boolean) => void;
	sendDeleteNotification: (id: string) => void;
	location: any;
	stateManager: any;
}

export class NotificationsPanel extends React.PureComponent<IProps, any> {
	public render = () => {
		const {notifications, labelLeft, labelRight} = this.props;

		if (this.props.notifications.length === 0) {
			return null;
		}

		return (<>
					<NotificationsPanelHeader labelLeft={labelLeft} labelRight={labelRight}/>
					<NotificationsPanelItem>
							<List style={{paddingBottom: 0, paddingTop: 0}} >
								{notifications.map((notification) =>
									<NotificationItem key={notification._id}
									{...notification} {...this.props }/>
								)}
							</List>
					</NotificationsPanelItem>
				</>);
	}
}
