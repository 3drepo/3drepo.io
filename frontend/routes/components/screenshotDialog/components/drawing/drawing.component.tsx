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
import { Image } from 'react-konva';

interface IProps {
	color?: string;
	height: number;
	width: number;
}

export class Drawing extends React.PureComponent <IProps, any> {
	public state = {
		isDrawing: false,
		mode: 'brush',
		canvas: {} as any,
		context: {} as any
	};

	public imageRef: any = React.createRef();
	public lastPointerPosition: any = { x: 0, y: 0 };

	public componentDidMount() {
		const canvas = document.createElement('canvas');
		canvas.width = this.props.width;
		canvas.height = this.props.height;
		const context = canvas.getContext('2d');

		this.setState({ canvas, context });
	}

	public handleMouseDown = () => {
		this.setState({ isDrawing: true });

		// TODO: improve
		const stage = this.imageRef.current.parent.parent;
		this.lastPointerPosition = stage.getPointerPosition();
	}

	public handleMouseUp = () => {
		this.setState({ isDrawing: false });
	}

	public handleMouseMove = () => {
		const { context, isDrawing, mode } = this.state;

		if (isDrawing) {
			// TODO: Don't always get a new context
			context.strokeStyle = '#df4b26';
			context.lineJoin = 'round';
			context.lineWidth = 5;

			if (mode === 'brush') {
				context.globalCompositeOperation = 'source-over';
			} else if (mode === 'eraser') {
				context.globalCompositeOperation = 'destination-out';
			}
			context.beginPath();

			let localPosition = {
				x: this.lastPointerPosition.x - this.imageRef.current.x(),
				y: this.lastPointerPosition.y - this.imageRef.current.y()
			};

			context.moveTo(localPosition.x, localPosition.y);

			// TODO: improve
			const stage = this.imageRef.current.parent.parent;

			const position = stage.getPointerPosition();
			localPosition = {
				x: position.x - this.imageRef.current.x(),
				y: position.y - this.imageRef.current.y()
			};

			context.lineTo(localPosition.x, localPosition.y);
			context.closePath();
			context.stroke();

			this.lastPointerPosition = position;
			this.imageRef.current.getLayer().draw();
		}
	}

	public render() {
		const { canvas } = this.state;

		return (
			<Image
				image={canvas}
				ref={this.imageRef}
				width={this.props.width}
				height={this.props.height}
				onMouseDown={this.handleMouseDown}
				onMouseUp={this.handleMouseUp}
				onMouseMove={this.handleMouseMove}
			/>
		);
	}
}
