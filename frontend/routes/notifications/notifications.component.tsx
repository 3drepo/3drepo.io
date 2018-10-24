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

interface IProps {
	fetchNotifications: () => void ;
	markNotificationAsRead: (id: string) => void;
	notifications: INotification[];
}

export class Notifications extends React.PureComponent<IProps, any> {
	public state = {
		open: false
	};

	public componentDidMount() {
		// This will download notifications from the server and save to the store on init
		this.props.fetchNotifications();
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
					<IconButton aria-label="Close panel" onClick={this.toggleDrawer.bind(this)}>
						<Icon>close</Icon>
					</IconButton>
					}>
					<Typography variant={"title"} color={"inherit"} >
						Notifications
					</Typography>
				</ListSubheaderToolbar>);
	}

	public render() {
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
					<List subheader={this.renderNotificationsHeader()} style={{height: '100%'}} >
						{this.props.notifications.length === 0 &&
							<NotificationEmptyItem/>}
						{this.props.notifications.length > 0 &&
							<>
							<NotificationsPanel
								labelLeft={simpleDate(new Date())} labelRight="this week"
								notifications={this.thisWeeksNotifications()}
								markNotificationAsRead={this.props.markNotificationAsRead}/>
							<NotificationsPanel
								labelRight="last week"
								notifications={this.lastWeeksNotifications() }
								markNotificationAsRead={this.props.markNotificationAsRead}/>
							<NotificationsPanel
								labelRight="more than two weeks ago"
								notifications={this.moreThanTwoWeeksAgoNotifications() }
								markNotificationAsRead={this.props.markNotificationAsRead}/>
							</>
						}
					</List>
				</Drawer>
			</MuiThemeProvider>
		);
	}
}
