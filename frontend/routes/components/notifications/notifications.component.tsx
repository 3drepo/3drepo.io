/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import Badge from '@material-ui/core/Badge';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Close from '@material-ui/icons/Close';
import MoreVert from '@material-ui/icons/MoreVert';
import React from 'react';

import { renderWhenTrue } from '../../../helpers/rendering';
import { simpleDate } from '../../../services/formatting/formatDate';
import { BarIconButton } from '../components.styles';
import { ListSubheaderToolbar } from '../listSubheaderToolbar/listSubheaderToolbar.component';
import { NotificationEmptyItem } from './components/emptyItem/emptyItem.component';
import { INotification } from './components/notificationItem/notificationItem.component';
import { NotificationsPanel } from './components/panel/panel.component';
import { NotificationsPanelHeader } from './components/panelHeader/panelHeader.component';
import { NotificationsIcon, NotificationsList, NotificationWeekHeader } from './notifications.styles';

interface IProps {
	notifications: INotification[];
	unreadCount: number;
	thisWeeksNotifications: INotification[];
	lastWeeksNotifications: INotification[];
	olderNotifications: INotification[];
	hasNotificationsThisWeek: boolean;
	hasNotificationsLastWeek: boolean;
	hasOlderNotifications: boolean;
	hasNotificationsUntilLastWeekOnly: boolean;
	hasOnlyOlderNotifications: boolean;
	currentUser: any;
	drawerOpened: boolean;
	sendGetNotifications: () => void;
	confirmSendDeleteAllNotifications: () => void;
	sendUpdateNotificationRead: (id: string, read: boolean) => void;
	sendUpdateAllNotificationsRead: (read: boolean) => void;
	showUpdatedFailedError: (errorMessage: string) => void;
	sendDeleteNotification: (id: string) => void;
	subscribeOnChanges: () => void;
	unsubscribeFromChanges: () => void;
	setDrawerPanelState: (open: boolean) => void;
}

const NotificationButton = ({ unreadCount, onClick }) => (
	<IconButton onClick={onClick} aria-label="Show notifications" aria-haspopup="true">
		<Badge
			badgeContent={unreadCount}
			color={unreadCount > 0 ? 'primary' : 'secondary'}
		>
			<NotificationsIcon fontSize="small" />
		</Badge>
	</IconButton>
);

export class Notifications extends React.PureComponent<IProps, any> {
	public state = {
		open: false,
		menuElement: null
	};

	get today() {
		return simpleDate(new Date());
	}

	get hasNotifications() {
		return this.props.notifications.length > 0;
	}

	private renderEmptyState = renderWhenTrue(() => <NotificationEmptyItem />);

	private renderList = renderWhenTrue(() => {
		const { hasNotificationsThisWeek, hasNotificationsLastWeek,
			hasOlderNotifications, thisWeeksNotifications } = this.props;
		return (
			<>
				<NotificationsPanelHeader />
				{hasNotificationsThisWeek && <NotificationWeekHeader labelLeft="This week" labelRight={this.today} />}
				{this.renderNotificationsPanel(thisWeeksNotifications)}
				{this.renderLastWeekNotifications(hasNotificationsLastWeek)}
				{this.renderOlderNotifications(hasOlderNotifications)}
			</>
		);
	});

	private renderLastWeekNotifications = renderWhenTrue(() => (
		<>
			<NotificationWeekHeader
				labelLeft="Last week"
				labelRight={this.props.hasNotificationsUntilLastWeekOnly ? this.today : ''}
			/>
			{this.renderNotificationsPanel(this.props.lastWeeksNotifications)}
		</>
	));

	private renderOlderNotifications = renderWhenTrue(() => (
		<>
			<NotificationWeekHeader
				labelLeft="more than two weeks ago"
				labelRight={this.props.hasOnlyOlderNotifications ? this.today : ''}
			/>
			{this.renderNotificationsPanel(this.props.olderNotifications)}
		</>
	));

	public componentDidMount() {
		this.props.sendGetNotifications();
		this.props.subscribeOnChanges();
	}

	public componentWillUnmount() {
		this.props.unsubscribeFromChanges();
	}

	public toggleDrawer = () => {
		this.props.setDrawerPanelState(!this.props.drawerOpened);
	}

	public toggleMenu = (e: React.SyntheticEvent) => {
		this.setState({ menuElement: this.state.menuElement ? null : e.currentTarget });
		return false;
	}

	public markAllNotifications = (read) => (e: React.SyntheticEvent) => {
		this.toggleMenu(e);
		this.props.notifications.forEach((notification) => {
			this.props.sendUpdateAllNotificationsRead(read);
		});
	}

	public deleteAllNotifications = (e: React.SyntheticEvent) => {
		this.toggleMenu(e);
		this.props.confirmSendDeleteAllNotifications();
	}

	public render() {
		const { unreadCount } = this.props;
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
						{this.renderEmptyState(!this.hasNotifications)}
						{this.renderList(this.hasNotifications)}
					</NotificationsList>
				</Drawer>
			</>
		);
	}

	private renderRightContent = () => (
		<>
			<BarIconButton aria-label="Menu" onClick={this.toggleMenu}>
				<MoreVert />
				<Menu
					anchorEl={this.state.menuElement}
					open={!!this.state.menuElement}
					onClose={this.toggleMenu}
				>
					<MenuItem
						onClick={this.markAllNotifications(true)}
					>
						Mark all as read
					</MenuItem>
					<MenuItem
						onClick={this.markAllNotifications(false)}
					>
						Mark all as unread
					</MenuItem>
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

	private renderNotificationsHeader = () => (
		<ListSubheaderToolbar rightContent={this.renderRightContent()}>
			<Typography variant="title" color="inherit">
				Notifications
			</Typography>
		</ListSubheaderToolbar>
	)

	private renderNotificationsPanel = (data) => {
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
}
