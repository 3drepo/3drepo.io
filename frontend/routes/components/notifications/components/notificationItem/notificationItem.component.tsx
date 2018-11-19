
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
import ChangeHistory from '@material-ui/icons/ChangeHistory';

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
	issuesId?: string[];
	revision?: string;
	timestamp: number;
}

const TYPES = {
	ISSUE_ASSIGNED : 'ISSUE_ASSIGNED',
	MODEL_UPDATED : 'MODEL_UPDATED'
};

interface IProps extends INotification {
	sendUpdateNotificationRead: (id: string, read: boolean) => void;
	sendDeleteNotification: (id: string) => void;
	history: any;
}

interface IState {
	icon: React.ComponentType;
	details: string;
	summary: string;
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

const getIcon = (notification) => {
	switch (notification.type) {
		case TYPES.ISSUE_ASSIGNED:
			return Place;
		case TYPES.MODEL_UPDATED:
			return ChangeHistory;
	}
};

const getDetails = (notification: IProps) => {
	switch (notification.type) {
		case TYPES.ISSUE_ASSIGNED:
			return `${notification.issuesId.length} assigned issues `;
		case TYPES.MODEL_UPDATED:
			return !notification.revision ? 'New revision uploaded' : `Revision ${notification.revision} uploaded`;

	}
};

const getSummary  = (notification) =>  `In ${notification.modelName}`;

export class NotificationItem extends React.PureComponent<IProps, IState> {
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

	public componentDidUpdate(prevProps: IProps) {
		if (prevProps.type !== this.props.type ) {
			this.setState({ icon: getIcon(this.props) });
		}

		if (prevProps.issuesId !== this.props.issuesId || prevProps.revision !== this.props.revision) {
			this.setState({ details : getDetails(this.props)});
		}

		if (prevProps.modelName !== this.props.modelName) {
			this.setState({ summary: getSummary(this.props) });
		}
	}

	public render = () => {
		const {read} =  this.props;

		const containerProps: any = {
			read: read.toString(),
			onClick: this.gotoNotification
		};

		return (
			<Container {...containerProps}>
				<Item button>
					<Avatar>
						{this.state.icon}
					</Avatar>

					{read &&
						<NotificationItemText
							primaryColor="rgba(0, 0, 0, 0.54)"
							secondaryColor="rgba(0, 0, 0, 0.24)"
							fontWeight={FONT_WEIGHT.NORMAL}
							primary={this.state.details}
							secondary={this.state.summary}
						/>
					}
					{!read &&
						<NotificationItemText
							primaryColor="rgba(0, 0, 0, 0.87)"
							secondaryColor="rgba(0, 0, 0, 0.54)"
							fontWeight={FONT_WEIGHT.BOLD}
							primary={this.state.details}
							secondary={this.state.summary}
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
