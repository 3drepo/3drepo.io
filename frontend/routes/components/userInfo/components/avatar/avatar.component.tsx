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

import { Container, AvatarImage, AvatarPlaceholder, StyledSvg } from "./avatar.styles";
import { COLOR } from '../../../../../styles';

interface IProps {
	url: string;
	altText: string;
	loading: boolean;
}

interface IState {
	avatarLoaded: boolean;
}

export class Avatar extends React.PureComponent<IProps, IState> {
	public state = {
		avatarLoaded: false
	};

	public renderPlaceholderSvgPath = () => (
		<path
			fill={COLOR.PRIMARY_MAIN}
			d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM12 14c-2.67 0-8 1.34-8 4v2h16v-2c+0-2.66-5.33-4-8-4z"
		/>
	)

	public handleImageLoaded = () => {
		this.setState({
			avatarLoaded: true
		});
	}

	public renderAvatarPlaceholder = () => (
		<AvatarPlaceholder>
			<StyledSvg>{this.renderPlaceholderSvgPath()}</StyledSvg>
		</AvatarPlaceholder>
	)

	public render() {
		const { url, altText, loading } = this.props;
		const { avatarLoaded } = this.state;

		return (
			<Container>
				{	(loading || !url || !avatarLoaded) && this.renderAvatarPlaceholder() }
				{ url && <AvatarImage src={url} alt={altText} onLoad={this.handleImageLoaded} /> }
			</Container>
		);
	}
}
