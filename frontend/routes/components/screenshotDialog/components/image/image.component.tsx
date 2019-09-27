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
import { Image as ImageComponent } from 'react-konva';
import { loadImage } from '../../../../../helpers/images';

interface IProps {
	src?: string;
	x: number;
	y: number;
}

export class Image extends React.Component<IProps, any> {
	public state = {
		image: null
	};

	public imageRef = React.createRef<any>();

	public image = this.imageRef.current;

	public componentDidMount() {
		this.loadImage();
	}

	public componentDidUpdate(oldProps) {
		if (oldProps.src !== this.props.src) {
			this.loadImage();
		}
	}

	public componentWillUnmount() {
		this.image.removeEventListener('load', this.handleLoad);
	}

	public loadImage() {
		const timestamp = new Date().getTime();
		this.image = new window.Image();
		this.image.crossOrigin = 'Anonymous';
		this.image.src = this.props.src + '?' + timestamp;
		this.image.addEventListener('load', this.handleLoad);
	}

	public handleLoad = () => {
		this.setState({
			image: this.image
		});
	}

	public render() {
		return (
			<ImageComponent
				x={this.props.x}
				y={this.props.y}
				image={this.state.image}
				ref={this.imageRef}
			/>
		);
	}
}
