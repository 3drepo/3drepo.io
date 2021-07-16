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

import React from 'react';

import { memoize } from 'lodash';

import { AvatarPlaceholder, Container, StyledAvatar } from './avatar.styles';

interface IProps {
	name: string;
	url?: string;
	loading?: boolean;
	size?: number;
	fontSize?: number;
}

interface IState {
	avatarLoaded: boolean;
}

const getInitials = memoize(
	(name = '') => name
		.split(' ')
		.map((word) => word[0])
		.join('')
		.toUpperCase()
);

export class Avatar extends React.PureComponent<IProps, IState> {
	public state = {
		avatarLoaded: false
	};

	public handleImageLoaded = () => {
		this.setState({
			avatarLoaded: true
		});
	}

	public renderPlaceholder = () => (
		<AvatarPlaceholder />
	)

	public renderInitials = (name) => (
		<StyledAvatar>
			{getInitials(name)}
		</StyledAvatar>
	)

	public renderImage = (url, altText) => (
		<StyledAvatar src={url} alt={altText} onLoad={this.handleImageLoaded} />
	)

	public render() {
		const { url, name, loading, ...containerProps } = this.props;
		const { avatarLoaded } = this.state;
		const isImageLoading = url && loading && !avatarLoaded;

		return (
			<Container {...containerProps}>
				{isImageLoading && this.renderPlaceholder()}
				{!url && this.renderInitials(name)}
				{url && !isImageLoading && this.renderImage(url, name)}
			</Container>
		);
	}
}
