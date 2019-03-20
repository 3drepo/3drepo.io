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
import Truncate from 'react-truncate';

import { PreviewItemInfo } from '../previewItemInfo/previewItemInfo.component';
import { renderWhenTrue } from '../../../../helpers/rendering';

import {
	MenuItemContainer,
	Thumbnail,
	Content,
	Description,
	RoleIndicator,
	Container,
	ThumbnailWrapper,
	ArrowButton,
	StyledArrowIcon,
	Name,
	Actions
} from './previewListItem.styles';
import { ActionMessage } from '../../../components/actionMessage/actionMessage.component';

interface IProps {
	className?: string;
	name: string;
	description: string;
	author: string;
	createdDate: string;
	thumbnail: string;
	roleColor: string;
	StatusIconComponent: any;
	statusColor: string;
	dueDate?: string;
	count?: number;
	active?: boolean;
	hasViewPermission?: boolean;
	modelLoaded?: boolean;
	hideThumbnail?: boolean;
	willBeRemoved?: boolean;
	panelName?: string;
	extraInfo?: string;
	onItemClick: (event?) => void;
	onArrowClick: (event?) => void;
	renderActions?: () => JSX.Element[];
}

export class PreviewListItem extends React.PureComponent<IProps, any> {
	get isExpiredDate() {
		const { createdDate, dueDate } = this.props;
		return createdDate >= dueDate ? 1 : 0;
	}

	public renderArrowButton = renderWhenTrue(() => (
		<ArrowButton onClick={this.props.onArrowClick} disabled={!this.props.modelLoaded}>
			<StyledArrowIcon />
		</ArrowButton>
	));

	public renderNameWithCounter = renderWhenTrue(() => <Name>{`${this.props.count}. ${this.props.name}`}</Name>);
	public renderName = renderWhenTrue(() => <Name>{this.props.name}</Name>);

	public renderThumbnail = renderWhenTrue(() => (
		<ThumbnailWrapper>
			<Thumbnail src={this.props.thumbnail} />
		</ThumbnailWrapper>
	));

	public renderActions = renderWhenTrue(() => (
		<Actions>
			{this.props.renderActions()}
		</Actions>
	));

	public renderDeleteMessage = renderWhenTrue(() =>
		<ActionMessage content={`This ${this.props.panelName} has been deleted`} />
	);

	public render() {
		const {
			roleColor,
			count,
			description,
			author,
			hideThumbnail,
			StatusIconComponent,
			statusColor,
			onItemClick,
			active,
			hasViewPermission,
			className,
			renderActions,
			willBeRemoved
		} = this.props;

		const shouldRenderActions = renderActions && active;
		const createdDate = !shouldRenderActions ? this.props.createdDate : '';
		const extraInfo = !shouldRenderActions ? this.props.extraInfo : '';

		return (
			<MenuItemContainer
				className={className}
				expired={this.isExpiredDate}
				onClick={onItemClick}
				disabled={willBeRemoved}
			>
				{this.renderDeleteMessage(willBeRemoved)}
				<Container>
					<RoleIndicator color={roleColor} />
					{this.renderThumbnail(!hideThumbnail)}
					<Content>
						{this.renderNameWithCounter(count)}
						{this.renderName(!count)}

						<PreviewItemInfo
							author={author}
							StatusIconComponent={StatusIconComponent}
							statusColor={statusColor}
							createdAt={createdDate}
							extraInfo={extraInfo}
						/>
						<Description>
							<Truncate lines={3}>{description || '(no description)'}</Truncate>
						</Description>
						{this.renderActions(renderActions && active)}
					</Content>
				</Container>
				{this.renderArrowButton(active && hasViewPermission)}
			</MenuItemContainer>
		);
	}
}
