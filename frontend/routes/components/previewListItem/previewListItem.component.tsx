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
import ArrowIcon from '@material-ui/icons/ArrowForward';

import { DateTime } from './../dateTime/dateTime.component';

import {
	MenuItemContainer,
	Thumbnail,
	Content,
	Title,
	Description,
	Author,
	Date,
	RoleIndicator,
	StatusIcon,
	Details,
	Container,
	ThumbnailWrapper,
	Status,
	ArrowContainer
} from './previewListItem.styles';

interface IProps {
	itemClick: () => void;
	handleArrowClick: () => void;
	title: string;
	description: string;
	author: string;
	createdAt: string;
	thumbnail: string;
	status: string;
	priority: string;
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

	public getStatusIcon = () => {
		return (<StatusIcon />);
	}

	public render() {
		const { title, description, author, createdAt, thumbnail, status, priority, handleArrowClick } = this.props;

		return (
			<MenuItemContainer expired={0} onClick={this.handleItemClick}>
				<Container>
					<RoleIndicator />
					<ThumbnailWrapper>
						<Thumbnail src={thumbnail} />
					</ThumbnailWrapper>
					<Content>
						<Title>{title}</Title>
						<Details>
							<Status>
								{this.getStatusIcon()}
								<Author>{author}</Author>
							</Status>
							<Date>
								<DateTime value={createdAt} format="DD MMM" />
							</Date>
						</Details>
						<Description>
							<Truncate lines={3}>
								{description}
							</Truncate>
						</Description>
					</Content>
				</Container>
				{ this.state.active &&
					<ArrowContainer onClick={handleArrowClick}>
						<ArrowIcon />
					</ArrowContainer>}
			</MenuItemContainer>
		);
	}
}
