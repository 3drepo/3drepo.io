/**
 *  Copyright (C) 2017 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General License for more details.
 *
 *  You should have received a copy of the GNU Affero General License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';

import { Author, Date, Details, Container, Status, Icon, ExtraInfo } from './previewItemInfo.styles';

import { DateTime } from '../../../components/dateTime/dateTime.component';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { NAMED_MONTH_DATE_FORMAT } from '../../../../services/formatting/formatDate';

interface IProps {
	author: string;
	createdAt: any;
	StatusIconComponent: any;
	statusColor: string;
	extraInfo?: string;
}

export class PreviewItemInfo extends React.PureComponent<IProps, any> {
	public renderDateTime = renderWhenTrue(() => (
		<Date>
			<DateTime value={this.props.createdAt} format={NAMED_MONTH_DATE_FORMAT} />
		</Date>
	));

	public renderStatusIcon = renderWhenTrue(() => {
		const { StatusIconComponent } = this.props;
		return (
			<Icon>
				<StatusIconComponent color="inherit" fontSize="inherit" />
			</Icon>
		);
	});

	public renderExtraInfo = renderWhenTrue(() => {
		return (
			<ExtraInfo>{this.props.extraInfo}</ExtraInfo>
		);
	});

	public render() {
		const { author, createdAt, statusColor, StatusIconComponent, extraInfo } = this.props;

		return(
			<Container>
				<Details>
					<Status color={statusColor}>
						{this.renderStatusIcon(StatusIconComponent)}
						<Author>{author}</Author>
					</Status>
					{this.renderExtraInfo(extraInfo)}
					{this.renderDateTime(createdAt)}
				</Details>
			</Container>
		);
	}
}
