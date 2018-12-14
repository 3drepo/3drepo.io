
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
import { Tooltip } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Place from '@material-ui/icons/Place';
import PanoramaFishEye from '@material-ui/icons/PanoramaFishEye';
import Lens from '@material-ui/icons/Lens';
import Clear from '@material-ui/icons/Clear';

import { FONT_WEIGHT } from '../../../../../styles';
import { SmallIconButton } from '../../../../components/smallIconButon/smallIconButton.component';
import { Item, Container, ItemText, ItemSecondaryAction } from './notificationItem.styles';

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
	history: any;
}

const LabelWithTooltip = (props) => (
	<Tooltip title={props.secondary} placement="bottom-start">
		<span>{props.secondary}</span>
	</Tooltip>
);

const NotificationItemText = (props) => {
	const fontWeight = props.fontWeight;
	const color = props.primaryColor;
	const secColor = props.secondaryColor;

	const primaryStyle = {color, fontWeight};
	const secondaryStyle = {color: secColor, fontWeight};

	return (
		<ItemText
			primaryTypographyProps={{style: primaryStyle}}
			secondaryTypographyProps={{style: secondaryStyle}}
			primary={props.primary}
			secondary={<LabelWithTooltip {...props} />}
		/>
	);
};

export class NotificationItem extends React.PureComponent<IProps, any> {
	public gotoNotification = () => {
		const {teamSpace, modelId, _id: notificationId, history} = this.props;
		history.push(`/viewer/${teamSpace}/${modelId}?notificationId=${notificationId}`);
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
		const {issuesId, modelName, read} =  this.props;

		const assignedIssuesText = `${issuesId.length} assigned issues `;
		const modelText = `In ${modelName}`;
		const containerProps: any = {
			read: read.toString(),
			onClick: this.gotoNotification
		};

		return (
			<Container {...containerProps}>
				<Item button>
					<Avatar>
						<Place />
					</Avatar>

					{read &&
						<NotificationItemText
							primaryColor="rgba(0, 0, 0, 0.54)"
							secondaryColor="rgba(0, 0, 0, 0.24)"
							fontWeight={FONT_WEIGHT.NORMAL}
							primary={assignedIssuesText}
							secondary={modelText}
						/>
					}
					{!read &&
						<NotificationItemText
							primaryColor="rgba(0, 0, 0, 0.87)"
							secondaryColor="rgba(0, 0, 0, 0.54)"
							fontWeight={FONT_WEIGHT.BOLD}
							primary={assignedIssuesText}
							secondary={modelText}
						/>
					}

					<ItemSecondaryAction>
						<SmallIconButton
							tooltip={`Mark as ${read ? 'read' : 'unread'}`}
							onClick={read ? this.markAsUnread : this.markAsRead}
							Icon={read ? PanoramaFishEye : Lens}
						/>
						<SmallIconButton
							tooltip="Clear"
							onClick={this.delete}
							Icon={Clear}
						/>
					</ItemSecondaryAction>
				</Item>
			</Container>
		);
	}
}
