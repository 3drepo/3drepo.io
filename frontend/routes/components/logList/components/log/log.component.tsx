/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import CloseIcon from '@material-ui/icons/Close';
import React from 'react';
import { renderWhenTrue } from '../../../../../helpers/rendering';
import { DATE_TIME_FORMAT } from '../../../../../services/formatting/formatDate';
import { TooltipButton } from '../../../../teamspaces/components/tooltipButton/tooltipButton.component';
import { DateTime } from '../../../dateTime/dateTime.component';
import DynamicUsername from '../../../dynamicUsername/dynamicUsername.container';
import {
	Container,
	Date,
	Info,
	MessageContainer,
	RemoveButtonWrapper,
	Screenshot,
	ScreenshotMessage,
	ScreenshotWrapper,
	SystemMessage,
	UserMessage
} from './log.styles';

interface IProps {
	comment: string;
	viewpoint: any;
	created: number;
	owner: string;
	action: any;
	companyName: string;
	userName: string;
	teamspace: string;
	guid: string;
	sealed: boolean;
	index: number;
	currentUser: string;
	removeLog: (index, guid) => void;
	setCameraOnViewpoint: (viewpoint) => void;
}

export class Log extends React.PureComponent<IProps, any> {
	get isScreenshot() {
		return this.props.viewpoint && this.props.viewpoint.screenshotPath;
	}

	get isAction() {
		return Boolean(this.props.action);
	}

	get isPlainComment() {
		return Boolean(this.props.comment) && !this.isScreenshot && !this.isAction;
	}

	get isRemovable() {
		return !this.props.sealed && !this.props.action && this.props.currentUser === this.props.owner;
	}

	public renderRemoveButton = renderWhenTrue(() => (
		<RemoveButtonWrapper screenshot={this.isScreenshot}>
			<TooltipButton
				label="Remove"
				action={this.removeComment}
				Icon={CloseIcon}
			/>
		</RemoveButtonWrapper>
	));

	public renderUserMessage = renderWhenTrue(() => (
		<MessageContainer>
			<UserMessage>{this.props.comment}</UserMessage>
			{this.renderRemoveButton(this.isRemovable)}
		</MessageContainer>
	));

	public renderSystemMessage = renderWhenTrue(() => (
		<SystemMessage>
			{this.props.comment}
		</SystemMessage>
	));

	public renderScreenshotMessage = renderWhenTrue(() => (
		<>
			<ScreenshotWrapper withMessage={!!this.props.comment}>
				{ this.props.viewpoint && this.props.viewpoint.screenshotPath ?
					<>
						<Screenshot src={this.props.viewpoint.screenshotPath} enablePreview />
						{this.renderRemoveButton(this.isRemovable)}
					</>
				: null }
			</ScreenshotWrapper>
			{this.props.comment && <ScreenshotMessage>{this.props.comment}</ScreenshotMessage>}
		</>
	));

	public renderUsername = renderWhenTrue((
		<DynamicUsername teamspace={this.props.teamspace} name={this.props.owner} />
	));

	public removeComment = (event) => {
		event.stopPropagation();
		this.props.removeLog(this.props.index, this.props.guid);
	}

	public renderInfo = () => (
		<Info>
			{this.renderUsername(!Boolean(this.props.action))}
			<Date>
				<DateTime value={this.props.created as any} format={DATE_TIME_FORMAT} />
			</Date>
		</Info>
	)

	public handleSetCameraOnViewpoint = () => {
		if (this.props.viewpoint) {
			this.props.setCameraOnViewpoint({viewpoint: this.props.viewpoint});
		}
	}

	public render() {
		return (
			<Container onClick={this.handleSetCameraOnViewpoint} clickable={Boolean(this.props.viewpoint)}>
				{this.renderSystemMessage(Boolean(this.props.action))}
				{this.renderUserMessage(this.isPlainComment)}
				{this.renderScreenshotMessage(this.isScreenshot)}
				{this.renderInfo()}
			</Container>
		);
	}
}
