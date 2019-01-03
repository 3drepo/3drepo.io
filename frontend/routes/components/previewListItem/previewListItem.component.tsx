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
import { renderWhenTrue } from '../../../helpers/rendering';

import {
	MenuItemContainer,
	Thumbnail,
	Content,
	Description,
	RoleIndicator,
	Container,
	ThumbnailWrapper,
	ArrowContainer,
	StyledArrowIcon,
	Name
} from './previewListItem.styles';

interface IProps {
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
	onItemClick: (event?) => void;
	onArrowClick: (event?) => void;
}

export class PreviewListItem extends React.PureComponent<IProps, any> {
	get isExpiredDate() {
		const { createdDate, dueDate } = this.props;
		return createdDate >= dueDate ? 1 : 0;
	}

	public renderArrowContainer = renderWhenTrue(
		<ArrowContainer onClick={this.props.onArrowClick}>
			<StyledArrowIcon />
		</ArrowContainer>
	);

	public renderNameWithCounter = renderWhenTrue(() => <Name>{`${this.props.count}. ${this.props.name}`}</Name>);
	public renderName = renderWhenTrue(() => <Name>{this.props.name}</Name>);

	public render() {
		const {
			roleColor,
			count,
			description,
			author,
			createdDate,
			thumbnail,
			StatusIconComponent,
			statusColor,
			onItemClick
		} = this.props;

		return (
			<MenuItemContainer expired={this.isExpiredDate} onClick={onItemClick}>
				<Container>
					<RoleIndicator color={roleColor} />
					<ThumbnailWrapper>
						<Thumbnail src={thumbnail} />
					</ThumbnailWrapper>
					<Content>
						{this.renderNameWithCounter(count)}
						{this.renderName(!count)}

						<PreviewItemInfo
							author={author}
							StatusIconComponent={StatusIconComponent}
							statusColor={statusColor}
							createdAt={createdDate}
						/>
						<Description>
							<Truncate lines={3}>{description}</Truncate>
						</Description>
					</Content>
				</Container>
				{this.renderArrowContainer(this.state.active)}
			</MenuItemContainer>
		);
	}
}
