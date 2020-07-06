
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
import { Tooltip } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Place from '@material-ui/icons/Place';
import React from 'react';

import ChangeHistory from '@material-ui/icons/ChangeHistory';
import Clear from '@material-ui/icons/Clear';
import Lens from '@material-ui/icons/Lens';
import PanoramaFishEye from '@material-ui/icons/PanoramaFishEye';

import { FONT_WEIGHT } from '../../../../../styles';
import { SmallIconButton } from '../../../../components/smallIconButon/smallIconButton.component';
import notificationsContainer from '../../notifications.container';
import { Container, Item, ItemSecondaryAction, ItemText } from './notificationItem.styles';

export interface INotification {
	_id: string;
	type: string;
	read: boolean;
	modelId: string;
	teamSpace: string;
	modelName: string;
	issuesId?: string[];
	referrer?: string;
	riskId?: string;
	issueId?: string;
	revision?: string;
	revisions?: string[];
	timestamp: number;
	errorMessage?: string;
	federation?: boolean;
}

const TYPES = {
	ISSUE_ASSIGNED : 'ISSUE_ASSIGNED',
	ISSUE_CLOSED : 'ISSUE_CLOSED',
	MODEL_UPDATED : 'MODEL_UPDATED',
	MODEL_UPDATED_FAILED : 'MODEL_UPDATED_FAILED',
	USER_REFERENCED : 'USER_REFERENCED'

};

interface IProps extends INotification {
	sendUpdateNotificationRead: (id: string, read: boolean) => void;
	sendDeleteNotification: (id: string) => void;
	showUpdatedFailedError: (errorMessage: string) => void;
	onClick?: (e: React.SyntheticEvent) => void;
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
		case TYPES.ISSUE_CLOSED:
		case TYPES.ISSUE_ASSIGNED:
		case TYPES.USER_REFERENCED:
			return (<Place />);
		case TYPES.MODEL_UPDATED:
		case TYPES.MODEL_UPDATED_FAILED:
			return (<ChangeHistory />);
	}
};

const getModelUpdatedDetails = (notification: IProps) => {
	if (notification.revision && !notification.revisions ||
		(!notification.revision && notification.revisions && notification.revisions.length === 1)
		) {
		const revision =  notification.revision || notification.revisions[0];
		return `Revision ${revision} uploaded`;
	}

	if (notification.revisions && notification.revisions.length) {
		const revisionsCount = notification.revisions.length + (notification.revision ? 1 : 0);
		return `${revisionsCount} revisions has been uploaded`;
	}

	return 'New revision uploaded';
};

const getFederationUpdatedDetails = ({modelName}: IProps) => {
	return `The federation was updated`;
};

const getDetails = (notification: IProps) => {
	switch (notification.type) {
		case TYPES.ISSUE_ASSIGNED:
			return `${notification.issuesId.length} assigned issues `;
		case TYPES.MODEL_UPDATED:
			if (!notification.federation) {
				return getModelUpdatedDetails(notification);
			} else {
				return getFederationUpdatedDetails(notification);
			}

		case TYPES.MODEL_UPDATED_FAILED:
			return 'New revision failed to import';
		case TYPES.ISSUE_CLOSED:
			return notification.issuesId.length <= 1 ? 'Issue has been closed' : `${notification.issuesId.length} closed issues`;
		case TYPES.USER_REFERENCED:
			return `${notification.referrer} has tagged you in a comment`;
	}
};

const getSummary  = (notification) =>  `In ${notification.modelName}`;

export class NotificationItem extends React.PureComponent<IProps, IState> {
	public gotoNotification = () => {
		this.props.sendUpdateNotificationRead(this.props._id, true);

		if (this.props.type === TYPES.MODEL_UPDATED_FAILED) {
			this.props.showUpdatedFailedError(this.props.errorMessage);
			return;
		}

		const {teamSpace, modelId, history, issuesId} = this.props;
		let pathname = `/viewer/${teamSpace}/${modelId}`;
		let search = '';

		if (this.props.type === TYPES.ISSUE_CLOSED) {
			// search = `?notificationId=${notificationId}`;
		}

		if (this.props.type === TYPES.ISSUE_ASSIGNED) {
			const issueId = issuesId && issuesId.length && issuesId[0];

			if (issueId) {
				search = `?issueId=${issueId}`;
			}
		}

		if (this.props.type === TYPES.USER_REFERENCED) {
			search = this.props.issueId ? `?issueId=${this.props.issueId}` : `?riskId=${this.props.riskId}`;
		}

		if (this.props.type === TYPES.MODEL_UPDATED && this.props.revision) {
			pathname += `/${this.props.revision}`;
		}

		history.push({pathname, search});
	}

	public onClick = (e: React.SyntheticEvent) => {
		if (this.props.onClick) {
			this.props.onClick(e);
		}

		this.gotoNotification();
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
		const {read} =  this.props;
		const icon = getIcon(this.props);
		const details = getDetails(this.props);
		const summary = getSummary(this.props);

		const containerProps: any = {
			read: read.toString(),
			onClick: this.onClick
		};

		return (
			<Container {...containerProps}>
				<Item button>
					<Avatar>
						{icon}
					</Avatar>

					<NotificationItemText
						primaryColor={read ? 'rgba(0, 0, 0, 0.54)' : 'rgba(0, 0, 0, 0.87)'}
						secondaryColor={read ? 'rgba(0, 0, 0, 0.24)' : 'rgba(0, 0, 0, 0.54)'}
						fontWeight={read ? FONT_WEIGHT.NORMAL : FONT_WEIGHT.BOLD}
						primary={details}
						secondary={summary}
					/>

					<ItemSecondaryAction>
						<SmallIconButton
							tooltip={`Mark as ${read ?  'unread' : 'read'}`}
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
