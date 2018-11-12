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
import { Badge, List, Menu, MenuItem } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import Icon from '@material-ui/core/Icon';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { groupBy, sortBy, toArray } from 'lodash';
import * as React from 'react';
import { getSunday, simpleDate } from '../../components/utils/js/utils.filter';
import { MuiTheme } from '../../styles';
import { BarIconButton, UserActionButton } from '../components/components.styles';
import { ListSubheaderToolbar } from '../components/listSubheaderToolbar/listSubheaderToolbar.component';
import { INotification } from './notification.item';
import { NotificationEmptyItem } from './notifications.emptyItem';
import { NotificationsPanel } from './notifications.panel';
import { NotificationsPanelHeader } from './notifications.panel.header';

// Props bound in <file://./notifications.container.ts>

interface IProps {
	sendGetNotifications: () => void ; // Bound to redux action sendGetNotifications
	confirmSendDeleteAllNotifications: () => void ; // Bound to redux saga action confirmSendDeleteAllNotifications
	sendUpdateNotificationRead: (id: string, read: boolean) => void; // Bound to redux saga sendUpdateNotificationRead
	sendDeleteNotification: (id: string) => void; // Bound to redux saga sendDeleteNotification
	notifications: INotification[]; // Bound to store state notifications

	// Bound to angular in <file://../angularBindings.ts> and <file://../../components/account/pug/account-menu.pug>
	location: any;
	stateManager: any;
}

// Note: tried to use styled components and didnt worked.
const NotificationWeekHeader = (props) =>
	(<NotificationsPanelHeader {...props}
		style={{paddingBottom: 0 }}/>);

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

	public componentDidMount() {
		// This will download notifications from the server and save to the store on init
		this.props.sendGetNotifications();
	}

	public toggleDrawer = () => {
		this.setState({open: !this.state.open });
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

	public renderNotificationsHeader() {
		return (<ListSubheaderToolbar rightContent={
					<>
					<BarIconButton aria-label='Menu' style={{marginRight: -18}} onClick={this.toggleMenu}>
						<Icon>more_vert</Icon>
						<Menu
							anchorEl={this.state.menuElement}
							open={!!this.state.menuElement}
							onClose={this.toggleMenu}
							>
								<MenuItem onClick={this.deleteAllNotifications} disabled={!this.hasNotifications()}>Clear all</MenuItem>
							</Menu>
					</BarIconButton>
					<BarIconButton aria-label='Close panel' onClick={this.toggleDrawer}>
						<Icon>close</Icon>
					</BarIconButton>
					</>
					}>
					<Typography variant='title' color='inherit' >
						Notifications
					</Typography>
				</ListSubheaderToolbar>);
	}

	public componentDidUpdate(prevProps: IProps) {
		if (prevProps.notifications !== this.props.notifications) {
			const unreadCount =  this.props.notifications.filter((n) => !n.read).length;
			const groupedByTeamspace = { thisWeek: [], lastWeek: [], older: []};

			const thisWeek =  this.thisWeeksNotifications(this.props.notifications);
			const lastWeek =  this.lastWeeksNotifications(this.props.notifications);
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

	public render() {
		const {unreadCount, groupedByTeamspace, hasThisWeekNot, hasLastWeekNot, hasOlderNot} = this.state;

		// Secondary color is used to make the badge disappear
		const badgeColor = unreadCount > 0 ? 'primary' : 'secondary';

		return (
			<MuiThemeProvider theme={MuiTheme}>
				<Badge badgeContent={unreadCount} color={badgeColor} style={ {marginRight: 10, marginTop: 2}}>
					<UserActionButton
						variant='flat'
						aria-label='Toggle panel'
						onClick={this.toggleDrawer}
					>
						<Icon fontSize='large'>notifications</Icon>
					</UserActionButton>
				</Badge>
				<Drawer variant='persistent' anchor='right' open={this.state.open} onClose={this.toggleDrawer}
						SlideProps={{unmountOnExit: true}}>
					<List subheader={this.renderNotificationsHeader()} style={{height: '100%', width: 300 }} >
						{!this.hasNotifications() &&
							<NotificationEmptyItem/>}
						{this.hasNotifications() &&
							<>
							<NotificationsPanelHeader/>
							{hasThisWeekNot &&
								<NotificationWeekHeader labelLeft='This week'
										labelRight={simpleDate(new Date())}/>
							}

							{groupedByTeamspace.thisWeek.map((notifications) =>
								(<NotificationsPanel
									key={`${notifications[0].teamSpace}-thisweek`}
									labelLeft={'In ' + notifications[0].teamSpace}
									{...this.props}
									notifications={notifications}
									/>)
							)}
							{hasLastWeekNot &&
								<NotificationWeekHeader labelLeft='Last week'/>
							}
							{groupedByTeamspace.lastWeek.map((notifications) =>
								(<NotificationsPanel
									key={`${notifications[0].teamSpace}-lastweek`}
									labelLeft={'In ' + notifications[0].teamSpace}
									{...this.props}
									notifications={notifications}
									/>)
							)}

							{hasOlderNot &&
								<NotificationWeekHeader labelLeft='more than two weeks ago'/>
							}
							{groupedByTeamspace.older.map((notifications) =>
								(<NotificationsPanel
									key={`${notifications[0].teamSpace}-older`}
									labelLeft={'In ' + notifications[0].teamSpace}
									{...this.props}
									notifications={notifications}
									/>)
							)}
							</>
						}
					</List>
				</Drawer>
			</MuiThemeProvider>
		);
	}
}
