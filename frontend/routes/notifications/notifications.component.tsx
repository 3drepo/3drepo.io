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
import { Button, List, IconButton} from "@material-ui/core";
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
	sendUpdateNotificationRead: (id: string, read: boolean) => void; // Bound to redux saga sendUpdateNotificationRead
	sendDeleteNotification: (id: string) => void; // Bound to redux saga sendDeleteNotification
	notifications: INotification[]; // Bound to store state notifications
}

export class Notifications extends React.PureComponent<IProps, any> {
	public state = {
		open: false
	};

	public componentDidMount() {
		// This will download notifications from the server and save to the store on init
		this.props.sendGetNotifications();
	}

	public toggleDrawer(e: React.SyntheticEvent) {
		e.preventDefault();
		e.nativeEvent.stopImmediatePropagation();
		e.nativeEvent.preventDefault();

		this.setState(Object.assign({open: !this.state.open }));
		return false;
	}

	public thisWeeksNotifications() {
		const lastSunday = getSunday().getTime();
		return this.props.notifications.filter((n) => n.timestamp > lastSunday);
	}

	public lastWeeksNotifications() {
		const lastSunday = getSunday().getTime();
		const prevSunday = getSunday(-1).getTime();
		return this.props.notifications.filter((n) => n.timestamp > prevSunday && n.timestamp < lastSunday );
	}

	public moreThanTwoWeeksAgoNotifications() {
		const prevSunday = getSunday(-1).getTime();
		return this.props.notifications.filter((n) => n.timestamp < prevSunday );
	}

	public renderNotificationsHeader() {
		return (<ListSubheaderToolbar rightContent={
					<BarIconButton aria-label="Close panel" onClick={this.toggleDrawer.bind(this)}>
						<Icon>close</Icon>
					</BarIconButton>
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
					onClick={this.toggleDrawer.bind(this)}
				>
					<Icon>notifications</Icon>
				</Button>
				<Drawer variant="persistent" anchor="right" open={this.state.open} onClose={this.toggleDrawer.bind(this)}
						SlideProps={{unmountOnExit: true}}>
					<List subheader={this.renderNotificationsHeader()} style={{height: '100%', width: 300 }} >
						{this.props.notifications.length === 0 &&
							<NotificationEmptyItem/>}
						{this.props.notifications.length > 0 &&
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
