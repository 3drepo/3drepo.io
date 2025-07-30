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
import { PureComponent, SyntheticEvent } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { INotification, NotificationItem } from '../notificationItem/notificationItem.component';
import { NotificationsPanelHeader } from '../panelHeader/panelHeader.component';
import { List, Container, NotificationsPanelItem } from './panel.styles';

interface IProps {
	navigate: NavigateFunction
	labelLeft?: string;
	labelRight?: string;
	notifications: INotification[];
	sendUpdateNotificationRead: (id: string, read: boolean) => void;
	sendDeleteNotification: (id: string) => void;
	showUpdatedFailedError: (errorMessage: string) => void;
	closePanel: (e: SyntheticEvent) => void;
}

export class NotificationsPanel extends PureComponent<IProps, any> {
	public renderNotifications = (notifications) => {
		return notifications.map((notification) => (
			<NotificationItem key={notification._id} {...notification} {...this.props} onClick={this.props.closePanel} />
		));
	}

	public render() {
		const {notifications, labelLeft, labelRight} = this.props;

		if (!notifications.length) {
			return null;
		}

		return (
			<Container>
				<NotificationsPanelHeader labelLeft={labelLeft} labelRight={labelRight} />
				<NotificationsPanelItem>
					<List style={{paddingBottom: 0, paddingTop: 0}}>
						{this.renderNotifications(notifications)}
					</List>
				</NotificationsPanelItem>
			</Container>
		);
	}
}
