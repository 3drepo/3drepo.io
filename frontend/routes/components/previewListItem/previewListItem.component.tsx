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

import { PreviewItemInfo } from './../previewItemInfo/previewItemInfo.component';

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
	itemClick: () => void;
	onArrowClick: () => void;
	name: string;
	description: string;
	author: string;
	createdDate: string;
	dueDate: string;
	thumbnail: string;
	status: string;
	priority: string;
	count: number;
	roleColor: string;
	StatusIconComponent: any;
	statusColor: string;
}

interface IState {
	active: boolean;
}

export class PreviewListItem extends React.PureComponent<IProps, IState> {
	public state = {
		active: false
	};

	public handleItemClick = () => {
		this.setState({ active: true });
	}

	public renderArrowContainer = () => {
		if (this.state.active) {
			return (
				<ArrowContainer onClick={this.props.onArrowClick}>
					<StyledArrowIcon />
				</ArrowContainer>
			);
		}
		return null;
	}

	public get isExpiredDate() {
		const { createdDate, dueDate } = this.props;
		return createdDate >= dueDate ? 1 : 0;
	}

	public render() {
		const {
			name,
			roleColor,
			count,
			description,
			author,
			createdDate,
			thumbnail,
			StatusIconComponent,
			statusColor
		} = this.props;

		return (
			<MenuItemContainer expired={this.isExpiredDate} onClick={this.handleItemClick}>
				<Container>
					<RoleIndicator color={roleColor} />
					<ThumbnailWrapper>
						<Thumbnail src={thumbnail} />
					</ThumbnailWrapper>
					<Content>
						<Name>{`${count}. ${name}`}</Name>
						<PreviewItemInfo
							author={author}
							StatusIconComponent={StatusIconComponent}
							statusColor={statusColor}
							createdAt={createdDate}
						/>
						<Description>
							<Truncate lines={3}>
								{description}
							</Truncate>
						</Description>
					</Content>
				</Container>
				{this.renderArrowContainer()}
			</MenuItemContainer>
		);
	}
}
