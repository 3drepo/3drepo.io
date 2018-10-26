
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
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

import Drawer from "@material-ui/core/Drawer";
import Icon from "@material-ui/core/Icon";
import { Button, Paper, ListItemSecondaryAction, IconButton, Tooltip } from "@material-ui/core";

import { theme } from "../../styles";
import { NotificationListItemSecondaryAction,
		NotificationListItem,
		NotificationListItemText } from "./notifications.styles";

export interface INotification {
	_id: string;
	type: string;
	read: boolean;
	modelId: string;
	teamSpace: string;
	modelName: string;
	issuesId: string[];
	timestamp: number;
}

interface IProps extends INotification {
	markNotificationAsRead: (id) => void;
}

export class NotificationItem extends React.PureComponent<IProps, any> {
	public gotoNotification(e: React.SyntheticEvent) {
		const { teamSpace , modelId, _id} = this.props;
		location.href =  `${teamSpace}/${modelId}?notificationId=${_id}`;
	}

	public delete(e: React.SyntheticEvent) {
		e.stopPropagation();
		alert("deleting stuff , mate");
	}

	public markAsRead(e: React.SyntheticEvent) {
		e.stopPropagation();
		this.props.markNotificationAsRead(this.props._id);
	}

	public render() {
		const backgroundColor = this.props.read ? "transparent" : "white";
		const fontWeight =  this.props.read ? 400 : 600;
		const color =  this.props.read ? "rgba(0, 0, 0, 0.54)" : "rgba(0, 0, 0, 0.87)";
		const secColor =  this.props.read ? "rgba(0, 0, 0, 0.24)" : "rgba(0, 0, 0, 0.54)";

		const primaryStyle =  Object.assign({color}, {fontWeight});
		const secondaryStyle =  Object.assign( {color: secColor},  {fontWeight});

		return (
			<Paper  style={ Object.assign({backgroundColor}, {margin: 5})}
							onClick={this.gotoNotification.bind(this)}>
			<NotificationListItem button >
					<Avatar>
						<Icon>place</Icon>
					</Avatar>
					<NotificationListItemText style={{padding: 9 }}
						primaryTypographyProps= { {style: primaryStyle}}
						secondaryTypographyProps= { {style: secondaryStyle}}

						primary={`${this.props.issuesId.length} assigned issues `}
						secondary={ `In ${this.props.modelName}`}
					/>
					<NotificationListItemSecondaryAction>
						{!this.props.read  &&
						<Tooltip title="Mark as read">
							<IconButton style={{width: 10, height: 10}}  component="span"
								aria-label="Mark as read"
								onClick={this.markAsRead.bind(this)}>
								<Icon>drafts</Icon>
							</IconButton>
						</Tooltip>
						}
						{this.props.read  &&
						<Tooltip title="Mark as unread">
							<IconButton style={{width: 10, height: 10}}  component="span"
								aria-label="Mark as unread"
								onClick={this.markAsRead.bind(this)}>
								<Icon>markunread</Icon>
							</IconButton>
						</Tooltip>
						}

						<Tooltip title="Delete">
							<IconButton style={{width: 10, height: 10}} component="span"
								aria-label="Delete"
								onClick={this.delete.bind(this)}>
								<Icon>delete</Icon>
							</IconButton>
						</Tooltip>
					</NotificationListItemSecondaryAction>
			</NotificationListItem>
			</Paper>
		);
	}
}
