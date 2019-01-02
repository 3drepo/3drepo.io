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
import { DateTime } from './../dateTime/dateTime.component';
import HoverableUsername from './../hoverableUsername/hoverableUsername.container';
import {
	Container, UserMessage, SystemMessage, Info, Screenshot, ScreenshotMessage, ScreenshotWrapper
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
}

export class Log extends React.PureComponent<IProps, any> {
	public renderScreenshot = (viewpoint, comment) => {
		return (
			<>
				<ScreenshotWrapper withMessage={!!comment}>
					<Screenshot src={viewpoint.screenshotPath} />
				</ScreenshotWrapper>
				{comment && <ScreenshotMessage>{comment}</ScreenshotMessage>}
			</>
		);
	}

	public renderMessage = (action, comment, created) => {
		if (action) {
			return (
				<SystemMessage>{action.text} at <DateTime value={created} format="HH:mm DD MMM" /></SystemMessage>
			);
		}
		if (comment) {
			return <UserMessage>{comment}</UserMessage>;
		}
		return null;
	}

	public renderInfo = (action, owner, created, teamspace) => {
		if (!action) {
			return (
				<Info>
					{<HoverableUsername teamspace={teamspace} name={owner} />}
					<DateTime value={created} format="HH:mm DD MMM" />
				</Info>
			);
		}
		return null;
	}

	public render() {
		const { action, comment, created, viewpoint, owner, teamspace } = this.props;
		return (
			<Container>
				{
					viewpoint && viewpoint.screenshotPath
					? this.renderScreenshot(viewpoint, comment)
					: this.renderMessage(action, comment, created)
				}
				{this.renderInfo(action, owner, created, teamspace)}
			</Container>
		);
	}
}
