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
import Drawer from "@material-ui/core/Drawer";
import Typography from '@material-ui/core/Typography';
import Icon from "@material-ui/core/Icon";
import {INotification} from "./notification.item";
import { Button, List, IconButton, Menu, MenuItem} from "@material-ui/core";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { MuiTheme } from "../../styles";
import { ListSubheaderToolbar } from "../components/listSubheaderToolbar/listSubheaderToolbar.component";
import { NotificationEmptyItem } from "./notifications.emptyItem";
import { NotificationsPanel } from "./notifications.panel";
import { simpleDate, getSunday } from "../../components/utils/js/utils.filter";
import { BarIconButton } from "../components/components.styles";

// Props bound in <file://./notifications.container.ts>
interface IProps {
	sendGetNotifications: () => void ; // Bound to redux action sendGetNotifications
	confirmSendDeleteAllNotifications: () => void ; // Bound to redux saga action confirmSendDeleteAllNotifications
	sendUpdateNotificationRead: (id: string, read: boolean) => void; // Bound to redux saga sendUpdateNotificationRead
	sendDeleteNotification: (id: string) => void; // Bound to redux saga sendDeleteNotification
	notifications: INotification[]; // Bound to store state notifications
}

export class Notifications extends React.PureComponent<IProps, any> {
	public state = {
		open: false,
		menuElement: null
	};

	public componentDidMount() {
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

	public thisWeeksNotifications = () => {
		const lastSunday = getSunday().getTime();
		return this.props.notifications.filter((n) => n.timestamp > lastSunday);
	}

	public lastWeeksNotifications = () => {
		const lastSunday = getSunday().getTime();
		const prevSunday = getSunday(-1).getTime();
		return this.props.notifications.filter((n) => n.timestamp > prevSunday && n.timestamp < lastSunday );
	}

	public moreThanTwoWeeksAgoNotifications = () => {
		const prevSunday = getSunday(-1).getTime();
		return this.props.notifications.filter((n) => n.timestamp < prevSunday );
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

	public render() {
		const actions = {
							sendUpdateNotificationRead: this.props.sendUpdateNotificationRead ,
							sendDeleteNotification: this.props.sendDeleteNotification
						};
		return (
			<MuiThemeProvider theme={MuiTheme}>
				<Button
					variant="fab"
					color="secondary"
					aria-label="Toggle panel"
					mini={true}
					onClick={this.toggleDrawer}
				>
					<Icon>notifications</Icon>
				</Button>
				<Drawer variant="persistent" anchor="right" open={this.state.open} onClose={this.toggleDrawer}
						SlideProps={{unmountOnExit: true}}>
					<List subheader={this.renderNotificationsHeader()} style={{height: '100%', width: 300 }} >
						{!this.hasNotifications() &&
							<NotificationEmptyItem/>}
						{this.hasNotifications() &&
							<>
							<NotificationsPanel
								labelLeft={simpleDate(new Date())} labelRight="this week"
								notifications={this.thisWeeksNotifications()}
								{...actions}
								/>
							<NotificationsPanel
								labelRight="last week"
								notifications={this.lastWeeksNotifications() }
								{...actions}/>
							<NotificationsPanel
								labelRight="more than two weeks ago"
								notifications={this.moreThanTwoWeeksAgoNotifications() }
								{...actions}/>
							</>
						}
					</List>
				</Drawer>
			</MuiThemeProvider>
		);
	}
}
