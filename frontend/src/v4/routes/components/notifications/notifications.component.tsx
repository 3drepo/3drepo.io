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
import { PureComponent, SyntheticEvent } from 'react';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Close from '@mui/icons-material/Close';
import MoreVert from '@mui/icons-material/MoreVert';
import NotificationsIcon from '@assets/icons/outlined/bell-outlined.svg';

import { formatSimpleDate } from '@/v5/helpers/intl.helper';
import { renderWhenTrue } from '../../../helpers/rendering';
import { BarIconButton } from '../components.styles';
import { ListSubheaderToolbar } from '../listSubheaderToolbar/listSubheaderToolbar.component';
import { NotificationEmptyItem } from './components/emptyItem/emptyItem.component';
import { INotification } from './components/notificationItem/notificationItem.component';
import { NotificationsPanel } from './components/panel/panel.component';
import { NotificationsPanelHeader } from './components/panelHeader/panelHeader.component';
import { NotificationsIconContainer, NotificationsList, NotificationWeekHeader } from './notifications.styles';

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
	id?: string;
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

const NotificationButton = ({ unreadCount, onClick, id }) => (
	<NotificationsIconContainer
        onClick={onClick}
        aria-label="Show notifications"
        aria-haspopup="true"
        id={id}
	>
		<Badge
			badgeContent={unreadCount}
			color={unreadCount > 0 ? 'primary' : 'secondary'}
		>
			<NotificationsIcon />
		</Badge>
	</NotificationsIconContainer>
);

export class Notifications extends PureComponent<IProps, any> {
	public state = {
		open: false,
		menuElement: null
	};

	get today() {
		return formatSimpleDate(new Date());
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

	public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<any>, snapshot?: any): void {
		if (prevProps.currentUser !==  this.props.currentUser) {
			this.props.unsubscribeFromChanges();
			this.props.subscribeOnChanges();
		}
	}

	public toggleDrawer = () => {
		this.props.setDrawerPanelState(!this.props.drawerOpened);
	}

	public toggleMenu = (e: SyntheticEvent) => {
		this.setState({ menuElement: this.state.menuElement ? null : e.currentTarget });
		return false;
	}

	public markAllNotifications = (read) => (e: SyntheticEvent) => {
		this.toggleMenu(e);
		this.props.notifications.forEach((notification) => {
			this.props.sendUpdateAllNotificationsRead(read);
		});
	}

	public deleteAllNotifications = (e: SyntheticEvent) => {
		this.toggleMenu(e);
		this.props.confirmSendDeleteAllNotifications();
	}

	public render() {
		const { unreadCount } = this.props;
		return (
			<>
				<NotificationButton onClick={this.toggleDrawer} unreadCount={unreadCount} id={this.props.id} />
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
			<Typography variant="h6" color="inherit">
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
