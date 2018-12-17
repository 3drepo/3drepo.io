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

import { Author, Container, UserMessage, SystemMessage, Info, Screenshot } from './previewLog.styles';
import { DateTime } from './../dateTime/dateTime.component';
interface IProps {
	comment: string;
	viewpoint: any;
	created: number;
	owner: string;
	action: any;
}

export class PreviewLog extends React.PureComponent<IProps, any> {
	public renderScreenshot = (viewpoint) => {
		if (viewpoint && viewpoint.screenshotPath) {
			return <Screenshot src={viewpoint.screenshotPath} />;
		}
		return null;
	}

	public renderMessage = (action, comment) => {
		if (action) {
			return <SystemMessage>{action.text}</SystemMessage>;
		}
		if (comment) {
			return <UserMessage>{comment}</UserMessage>;
		}
		return null;
	}

	public render() {
		const { action, comment, created, viewpoint, owner } = this.props;
		console.log('this.props', this.props);
		return (
			<Container>
				{this.renderMessage(action, comment)}
				{this.renderScreenshot(viewpoint)}
				<Info>
					<Author>{owner}</Author>
					<DateTime value={created} format="HH:mm DD MMM" />
				</Info>
			</Container>
		);
	}
}
