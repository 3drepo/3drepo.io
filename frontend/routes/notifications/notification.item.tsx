
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
import { Paper, Tooltip } from "@material-ui/core";
import Avatar from '@material-ui/core/Avatar';
import Icon from "@material-ui/core/Icon";
import * as React from "react";
import { SmallIconButton } from "../components/smallIconButon/smallIconButton.component";
import { NotificationListItem,
		NotificationListItemSecondaryAction,
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
	sendUpdateNotificationRead: (id: string, read: boolean) => void;
	sendDeleteNotification: (id: string) => void;
}

const NotificationItemText = (props) => {
	const fontWeight = props.fontWeight;
	const color =  props.primaryColor;
	const secColor = props.secondaryColor;

	const primaryStyle =  Object.assign({color}, {fontWeight});
	const secondaryStyle =  Object.assign( {color: secColor},  {fontWeight});

	return (<NotificationListItemText
		primaryTypographyProps = { {style: primaryStyle} }
		secondaryTypographyProps = { {style: secondaryStyle} }
		primary={props.primary}
		secondary={props.secondary }/>);
};

export class NotificationItem extends React.PureComponent<IProps, any> {
	public gotoNotification = (e: React.SyntheticEvent) => {
		const { teamSpace , modelId, _id} = this.props;
		location.href =  `${teamSpace}/${modelId}?notificationId=${_id}`;
	}

	public delete = (e: React.SyntheticEvent) => {
		e.stopPropagation();
		this.props.sendDeleteNotification(this.props._id);
	}

	public markAsRead = (e: React.SyntheticEvent) => {
		e.stopPropagation();
		this.props.sendUpdateNotificationRead(this.props._id, true);
	}

	public markAsUnread = (e: React.SyntheticEvent) => {
		e.stopPropagation();
		this.props.sendUpdateNotificationRead(this.props._id, false);
	}

	public render = () => {
		const {issuesId , teamSpace, modelName, read} =  this.props;

		const backgroundColor = read ? "transparent" : "white";
		const assignedIssuesText = `${issuesId.length} assigned issues `;
		const modelText = `In ${modelName}`;

		return (
			<Paper  style={ Object.assign({backgroundColor}, {margin: 5})}
							onClick={this.gotoNotification.bind(this)}>
			<NotificationListItem button >
					<Avatar>
						<Icon>place</Icon>
					</Avatar>

					{read &&
						<NotificationItemText
							primaryColor="rgba(0, 0, 0, 0.54)" secondaryColor="rgba(0, 0, 0, 0.24)" fontWeight="400"
							primary={assignedIssuesText} secondary={modelText}
							/>
					}
					{!read &&
						<NotificationItemText
							primaryColor="rgba(0, 0, 0, 0.87)" secondaryColor="rgba(0, 0, 0, 0.54)" fontWeight="600"
							primary={assignedIssuesText} secondary={modelText}
							/>
					}

					<NotificationListItemSecondaryAction>
						{!read  &&
						<SmallIconButton tooltip="Mark as read" onClick={this.markAsRead}>
							drafts
						</SmallIconButton>
						}
						{read  &&
						<SmallIconButton tooltip="Mark as unread" onClick={this.markAsUnread}>
							markunread
						</SmallIconButton>
						}
						<SmallIconButton tooltip="Delete" onClick={this.delete}>
							delete
						</SmallIconButton>
					</NotificationListItemSecondaryAction>

			</NotificationListItem>
			</Paper>
		);
	}
}
