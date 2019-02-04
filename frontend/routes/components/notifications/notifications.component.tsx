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
import * as React from 'react';
import { groupBy, sortBy, toArray } from 'lodash';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Drawer from '@material-ui/core/Drawer';
import Badge from '@material-ui/core/Badge';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MoreVert from '@material-ui/icons/MoreVert';
import Close from '@material-ui/icons/Close';

import { simpleDate } from '../../../services/formatting/formatDate';
import { getAngularService } from '../../../helpers/migration';
import { BarIconButton } from '../components.styles';
import { ListSubheaderToolbar } from '../listSubheaderToolbar/listSubheaderToolbar.component';
import { INotification } from './components/notificationItem/notificationItem.component';
import { NotificationEmptyItem } from './components/emptyItem/emptyItem.component';
import { NotificationsPanel } from './components/panel/panel.component';
import { NotificationsPanelHeader } from './components/panelHeader/panelHeader.component';
import { NotificationsList, NotificationsIcon } from './notifications.styles';

/**
 * Gets the date of the sunday thats away from the offset .
 * If offsets == 0 is last sunday (if today is sunday returns today)
 * If offset > 0 , the sundays from next week on
 * If offset < 0 , the sundays before the current week
 */
const getSunday = (offset: number = 0) => {
	const sunday = new Date();
	sunday.setDate(sunday.getDate() - sunday.getDay() + offset * 7);
	sunday.setHours(0, 0, 0, 0);
	return sunday;
};

interface IProps {
	notifications: INotification[];
	currentUser: any;
	drawerOpened: boolean;
	sendGetNotifications: () => void;
	confirmSendDeleteAllNotifications: () => void;
	sendUpdateNotificationRead: (id: string, read: boolean) => void;
	showUpdatedFailedError: (errorMessage: string) => void;
	sendDeleteNotification: (id: string) => void;
	deleteNotification: (notification: any) => void;
	upsertNotification: (notification: any) => void;
	setDrawerPanelState: (open: boolean) => void;
}

const NotificationButton = ({ unreadCount, onClick }) => (
	<IconButton onClick={onClick} aria-label="Show notifications" aria-haspopup="true">
		<Badge
			badgeContent={unreadCount}
			color={unreadCount > 0 ? 'primary' : 'secondary'}
		>
			<NotificationsIcon fontSize="small"/>
		</Badge>
	</IconButton>
);

// Note: tried to use styled components and didnt worked.
const NotificationWeekHeader = (props) => <NotificationsPanelHeader {...props} style={{paddingBottom: 0 }} />;

export class Notifications extends React.PureComponent<IProps, any> {
	public state = {
		hasThisWeekNot: false,
		hasLastWeekNot: false,
		hasOlderNot: false,
		unreadCount: 0,
		groupedByTeamspace: {thisWeek: [] , lastWeek: [] , older: []},
		open: false,
		menuElement: null
	};

	public chatService = getAngularService('ChatService') as any;

	public componentDidMount() {
		this.props.sendGetNotifications();

		const chatChannel = this.chatService.getChannel(this.props.currentUser.username);
		chatChannel.notifications.subscribeToUpserted(this.props.upsertNotification, this);
		chatChannel.notifications.subscribeToDeleted(this.props.deleteNotification, this);
	}

	public componentWillUnmount() {
		const chatChannel = this.chatService.getChannel(this.props.currentUser.username);
		chatChannel.notifications.unsubscribeFromUpserted(this.props.upsertNotification);
		chatChannel.notifications.unsubscribeFromDeleted(this.props.deleteNotification);
	}

	public toggleDrawer = () => {
		this.props.setDrawerPanelState(!this.props.drawerOpened);
	}

	public toggleMenu = (e: React.SyntheticEvent) => {
		this.setState({ menuElement: this.state.menuElement ? null : e.currentTarget });
		return false;
	}

	public deleteAllNotifications = (e: React.SyntheticEvent) => {
		this.toggleMenu(e);
		this.props.confirmSendDeleteAllNotifications();
	}

	public thisWeeksNotifications = (notifications) => {
		const lastSunday = getSunday().getTime();
		return notifications.filter((n) => n.timestamp > lastSunday);
	}

	public lastWeeksNotifications = (notifications) => {
		const lastSunday = getSunday().getTime();
		const prevSunday = getSunday(-1).getTime();
		return notifications.filter((n) => n.timestamp > prevSunday && n.timestamp < lastSunday );
	}

	public moreThanTwoWeeksAgoNotifications = (notifications) => {
		const prevSunday = getSunday(-1).getTime();
		return notifications.filter((n) => n.timestamp < prevSunday );
	}

	public groupByTeamSpace = (notifications) => {
		return toArray(groupBy(sortBy(notifications, 'teamSpace'), 'teamSpace'));
	}

	public hasNotifications = () => {
		return this.props.notifications.length > 0;
	}

	public renderRightContent = () => (
		<>
			<BarIconButton aria-label="Menu" onClick={this.toggleMenu}>
				<MoreVert />
				<Menu
					anchorEl={this.state.menuElement}
					open={!!this.state.menuElement}
					onClose={this.toggleMenu}
				>
					<MenuItem
						onClick={this.deleteAllNotifications}
						disabled={!this.props.notifications.length}
					>
						Clear all
					</MenuItem>
				</Menu>
			</BarIconButton>
			<BarIconButton aria-label="Close panel" onClick={this.toggleDrawer}>
				<Close />
			</BarIconButton>
		</>
	)

	public renderNotificationsHeader = () => (
		<ListSubheaderToolbar rightContent={this.renderRightContent()}>
			<Typography variant="title" color="inherit">
				Notifications
			</Typography>
		</ListSubheaderToolbar>
	)

	public componentDidUpdate(prevProps: IProps) {
		if (prevProps.notifications !== this.props.notifications) {
			const unreadCount =  this.props.notifications.filter((n) => !n.read).length;
			const groupedByTeamspace = { thisWeek: [], lastWeek: [], older: []};

			const thisWeek = this.thisWeeksNotifications(this.props.notifications);
			const lastWeek = this.lastWeeksNotifications(this.props.notifications);
			const older = this.moreThanTwoWeeksAgoNotifications(this.props.notifications);

			groupedByTeamspace.thisWeek = this.groupByTeamSpace(thisWeek);
			groupedByTeamspace.lastWeek = this.groupByTeamSpace(lastWeek);
			groupedByTeamspace.older = this.groupByTeamSpace(older);

			const hasThisWeekNot = thisWeek.length > 0 ;
			const hasLastWeekNot = lastWeek.length > 0;
			const hasOlderNot = older.length > 0;
			this.setState({unreadCount, groupedByTeamspace, hasThisWeekNot, hasLastWeekNot, hasOlderNot });
		}
	}

	public renderNotificationsPanel = (data) => {
		return data.map((notifications) => (
			<NotificationsPanel
				key={`${notifications[0].teamSpace}`}
				labelLeft={`In ${notifications[0].teamSpace}`}
				{...this.props}
				notifications={notifications}
				closePanel={this.toggleDrawer}
			/>
		));
	}

	public render() {
		const {unreadCount, groupedByTeamspace, hasThisWeekNot, hasLastWeekNot, hasOlderNot} = this.state;
		const {notifications} = this.props;

		// Secondary color is used to make the badge disappear
		const today = simpleDate(new Date());
		const hasNotifications = notifications.length > 0;

		return (
			<>
				<NotificationButton onClick={this.toggleDrawer} unreadCount={unreadCount}  />
				<Drawer
					variant="persistent"
					anchor="right"
					open={this.props.drawerOpened}
					onClose={this.toggleDrawer}
					SlideProps={{unmountOnExit: true}}
				>
					<NotificationsList subheader={this.renderNotificationsHeader()}>
						{!hasNotifications &&
							<NotificationEmptyItem/>}
						{hasNotifications &&
							<>
								<NotificationsPanelHeader />
								{hasThisWeekNot && <NotificationWeekHeader labelLeft="This week" labelRight={today}/>}
								{this.renderNotificationsPanel(groupedByTeamspace.thisWeek)}

								{
									hasLastWeekNot && (
										<NotificationWeekHeader
											labelLeft="Last week"
											labelRight={!hasThisWeekNot ? today : ''}
										/>
									)								}
								{this.renderNotificationsPanel(groupedByTeamspace.lastWeek)}

								{
									hasOlderNot && (
										<NotificationWeekHeader
											labelLeft="more than two weeks ago"
											labelRight={!hasThisWeekNot && !hasLastWeekNot ? today : ''}
										/>
									)
								}
								{this.renderNotificationsPanel(groupedByTeamspace.older)}
							</>
						}
					</NotificationsList>
				</Drawer>
			</>
		);
	}
}
