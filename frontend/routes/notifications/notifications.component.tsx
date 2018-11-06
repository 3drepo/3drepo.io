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
import { Badge, List, Menu, MenuItem } from "@material-ui/core";
import Drawer from "@material-ui/core/Drawer";
import Icon from "@material-ui/core/Icon";
import { MuiThemeProvider } from "@material-ui/core/styles";
import Typography from '@material-ui/core/Typography';
import { groupBy, sortBy, toArray } from "lodash";
import * as React from "react";
import { getSunday, simpleDate } from "../../components/utils/js/utils.filter";
import { MuiTheme } from "../../styles";
import { BarIconButton, UserActionButton } from "../components/components.styles";
import { ListSubheaderToolbar } from "../components/listSubheaderToolbar/listSubheaderToolbar.component";
import { INotification } from "./notification.item";
import { NotificationEmptyItem } from "./notifications.emptyItem";
import { NotificationsPanel } from "./notifications.panel";
import { NotificationsPanelHeader } from "./notifications.panel.header";

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
		open: false,
		menuElement: null
	};

	public componentDidMount = () => {
		// This will download notifications from the server and save to the store on init
		this.props.sendGetNotifications();
	}

	public toggleDrawer = (e: React.SyntheticEvent) => {
		this.setState(Object.assign({open: !this.state.open }));
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

	public hasNotifications = () => {
		return this.props.notifications.length > 0;
	}

	public renderNotificationsHeader = () => {
		return (<ListSubheaderToolbar rightContent={
					<>
					<BarIconButton aria-label="Menu" style={{marginRight: -18}} onClick={this.toggleMenu}>
						<Icon>more_vert</Icon>
						<Menu
							anchorEl={this.state.menuElement}
							open={!!this.state.menuElement}
							onClose={this.toggleMenu}
							>
								<MenuItem onClick={this.deleteAllNotifications} disabled={!this.hasNotifications()}>Delete all</MenuItem>
							</Menu>
					</BarIconButton>
					<BarIconButton aria-label="Close panel" onClick={this.toggleDrawer}>
						<Icon>close</Icon>
					</BarIconButton>
					</>
					}>
					<Typography variant={"title"} color={"inherit"} >
						Notifications
					</Typography>
				</ListSubheaderToolbar>);
	}

	public render = () => {
		const count =  this.props.notifications.filter((n) => !n.read).length;
		const badgeColor = count > 0 ? "primary" : "secondary"; // Secondary color is used to make the badge disappear
		const groupedByTeamspace = toArray(groupBy(sortBy(this.props.notifications, "teamSpace"), "teamSpace"));

		return (
			<MuiThemeProvider theme={MuiTheme}>
				<Badge badgeContent={count} color={badgeColor} style={ {marginRight: 10, marginTop: 2}}>
					<UserActionButton
						variant="flat"
						aria-label="Toggle panel"
						onClick={this.toggleDrawer}
					>
						<Icon fontSize="large">notifications</Icon>
					</UserActionButton>
				</Badge>
				<Drawer variant="persistent" anchor="right" open={this.state.open} onClose={this.toggleDrawer}
						SlideProps={{unmountOnExit: true}}>
					<List subheader={this.renderNotificationsHeader()} style={{height: '100%', width: 300 }} >
						{!this.hasNotifications() &&
							<NotificationEmptyItem/>}
						{this.hasNotifications() &&
							<>
							<NotificationsPanelHeader/>
							{this.thisWeeksNotifications(this.props.notifications).length > 0 &&
								<NotificationWeekHeader labelLeft="This week"
										labelRight={simpleDate(new Date())}/>
							}

							{groupedByTeamspace.map((notifications) =>
								(<NotificationsPanel
									key={`${notifications[0].teamSpace}-thisweek`}
									labelLeft={"In " + notifications[0].teamSpace}
									{...this.props}
									notifications={this.thisWeeksNotifications(notifications)}
									/>)
							)}
							{this.lastWeeksNotifications(this.props.notifications).length > 0 &&
								<NotificationWeekHeader labelLeft="Last week"/>
							}
							{groupedByTeamspace.map((notifications) =>
								(<NotificationsPanel
									key={`${notifications[0].teamSpace}-lastweek`}
									labelLeft={"In " + notifications[0].teamSpace}
									{...this.props}
									notifications={this.lastWeeksNotifications(notifications) }
									/>)
							)}

							{this.moreThanTwoWeeksAgoNotifications(this.props.notifications).length > 0 &&
								<NotificationWeekHeader labelLeft="more than two weeks ago"/>
							}
							{groupedByTeamspace.map((notifications) =>
								(<NotificationsPanel
									key={`${notifications[0].teamSpace}-older`}
									labelLeft={"In " + notifications[0].teamSpace}
									{...this.props}
									notifications={this.moreThanTwoWeeksAgoNotifications(notifications) }
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
