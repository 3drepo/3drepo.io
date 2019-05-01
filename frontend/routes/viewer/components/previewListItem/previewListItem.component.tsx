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
	createdDate: number;
	thumbnail: string;
	roleColor: string;
	StatusIconComponent: any;
	statusColor: string;
	due_date?: number;
	count?: number;
	number?: number;
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
	willBeClosed?: boolean;
}

export class PreviewListItem extends React.PureComponent<IProps, any> {
	get isExpiredDate() {
		const { due_date } = this.props;
		return new Date().valueOf() >= due_date ? 1 : 0;
	}

	public renderArrowButton = renderWhenTrue(() => (
		<ArrowButton onClick={this.props.onArrowClick} disabled={!this.props.modelLoaded}>
			<StyledArrowIcon />
		</ArrowButton>
	));

	public renderNameWithCounter = renderWhenTrue(() =>
		<Name>{`${this.props.number || this.props.count} ${this.props.name}`}</Name>);
	public renderName = renderWhenTrue(() => <Name>{this.props.name}</Name>);
	public renderClosedMessage = renderWhenTrue(() => <ActionMessage content="This issue is now closed" />);

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
		<ActionMessage content={`This ${this.props.panelName || 'item'} has been deleted`} />
	);

	public render() {
		const {
			roleColor,
			count,
			// tslint:disable-next-line
			number,
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
			willBeRemoved,
			willBeClosed
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
					{this.renderClosedMessage(willBeClosed)}
					<RoleIndicator color={roleColor} />
					{this.renderThumbnail(!hideThumbnail)}
					<Content>
						{this.renderNameWithCounter(number || count)}
						{this.renderName(!(number || count))}

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
