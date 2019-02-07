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

import * as React from 'react';
import { DateTime } from '../../../dateTime/dateTime.component';
import DynamicUsername from '../..//../dynamicUsername/dynamicUsername.container';
import {
	Container,
	UserMessage,
	SystemMessage,
	Info,
	Screenshot,
	ScreenshotMessage,
	ScreenshotWrapper,
	MessageContainer,
	RemoveButtonWrapper
} from './log.styles';
import CloseIcon from '@material-ui/icons/Close';
import { TooltipButton } from '../../../../../routes/teamspaces/components/tooltipButton/tooltipButton.component';
import { renderWhenTrue } from '../../../../../helpers/rendering';

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
	removeLog: (index, guid) => void;
}

export class Log extends React.PureComponent<IProps, any> {
	get isScreenshot() {
		return this.props.viewpoint && this.props.viewpoint.screenshotPath;
	}

	get isAction() {
		return Boolean(this.props.action);
	}

	get isCommentWithScreenshot() {
		return Boolean(this.props.comment) && this.isScreenshot;
	}

	get isPlainComment() {
		return Boolean(this.props.comment) && !this.isScreenshot && !this.isAction;
	}

	public removeComment = () => {
		this.props.removeLog(this.props.index, this.props.guid);
	}

	public renderRemoveButton = renderWhenTrue(
		<RemoveButtonWrapper>
			<TooltipButton
				label="Remove"
				action={this.removeComment}
				Icon={CloseIcon}
			/>
		</RemoveButtonWrapper>
	);

	public renderUserMessage = renderWhenTrue(
		<MessageContainer>
			<UserMessage>{this.props.comment}</UserMessage>
			{this.renderRemoveButton(!this.props.sealed && !this.props.action)}
		</MessageContainer>
	);

	public renderSystemMessage = renderWhenTrue(
		<SystemMessage>
			{this.props.comment}
		</SystemMessage>
	);

	public renderScreenshotMessage = renderWhenTrue(
		<>
			<ScreenshotWrapper withMessage={!!this.props.comment}>
				{ this.props.viewpoint && this.props.viewpoint.screenshotPath ?
				<Screenshot src={this.props.viewpoint.screenshotPath} />
				: null }
			</ScreenshotWrapper>
			{this.props.comment && <ScreenshotMessage>{this.props.comment}</ScreenshotMessage>}
		</>
	);

	public renderInfo = renderWhenTrue(
		<Info>
			{<DynamicUsername teamspace={this.props.teamspace} name={this.props.owner} />}
			<DateTime value={this.props.created as any} format="HH:mm DD MMM" />
		</Info>
	);

	public render() {
		return (
			<Container>
				{this.renderSystemMessage(Boolean(this.props.action))}
				{this.renderUserMessage(this.isPlainComment)}
				{this.renderScreenshotMessage(this.isCommentWithScreenshot)}
				{this.renderInfo(!this.isAction)}
			</Container>
		);
	}
}
