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
import { PureComponent, ReactNode } from 'react';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { NAMED_MONTH_DATE_FORMAT } from '../../../../services/formatting/formatDate';
import { DateTime } from '../../../components/dateTime/dateTime.component';
import { UserMarker } from '../../../components/messagesList/components/message/components/userMarker';
import { Author, Container, Date, Details, ExtraInfo, Icon, Status, OpenInViewerButton } from './previewItemInfo.styles';

interface IProps {
	author: string;
	createdAt: any;
	StatusIconComponent: any;
	statusColor: string;
	extraInfo?: string;
	actionButton?: ReactNode;
	panelType?: string;
	showModelButton?: boolean;
	type?: string;
	id?: string;
	urlParams?: any;
}

export class PreviewItemInfo extends PureComponent<IProps, any> {

	public renderViewModel = renderWhenTrue(() => {
		const { type, id } = this.props;
		const { teamspace, modelId } = this.props.urlParams;
		return (
			<OpenInViewerButton
				preview
				teamspace={teamspace}
				model={modelId}
				query={`${type}Id=${id}`}
			/>
		);
	});

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

	public renderActionButton = renderWhenTrue(() => {
		return <>{this.props.actionButton}</>;
	});

	public render() {
		const {
			author,
			createdAt,
			statusColor,
			StatusIconComponent,
			extraInfo,
			actionButton,
			panelType,
			showModelButton,
			urlParams
			} = this.props;

		return(
			<Container>
				<Details panelType={panelType}>
					<UserMarker name={author}>
						<Status color={statusColor}>
							{this.renderStatusIcon(StatusIconComponent)}
							<Author>{author}</Author>
						</Status>
					</UserMarker>
					{this.renderExtraInfo(extraInfo)}
					{this.renderDateTime(createdAt)}
					{this.renderViewModel(showModelButton && urlParams)}
					{this.renderActionButton(actionButton)}
				</Details>
			</Container>
		);
	}
}
