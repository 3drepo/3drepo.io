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

import Button from '@material-ui/core/Button';
import { Container, Canvas, ToolsContainer } from './screenshotDialog.styles';

interface IProps {
	image: string;
	onSave: (screenshot) => void;
}

export class ScreenshotDialog extends React.PureComponent<IProps, any> {
	public state = {
		color: '#00ff00',
		brushSize: 5
	};

	public isDrawing;

	public canvasRef = React.createRef<any>();
	public brushRef = React.createRef<any>();

	public prevMousePosition = { x: 0, y: 0 };
	public currMousePosition = { x: 0, y: 0 };

	get canvas() {
		return this.canvasRef.current as any;
	}

	get canvasContext() {
		return this.canvas.getContext('2d');
	}

	get brushElement() {
		return this.brushRef.current;
	}

	public setBrushMode = () => {
		this.canvasContext.globalCompositeOperation = 'source-over';
		this.canvasContext.strokeStyle = this.state.color;
		this.canvasContext.lineWidth = this.state.brushSize;
	}

	public setEraseMode = () => {
		this.canvasContext.globalCompositeOperation = 'destination-out';
		this.canvasContext.lineWidth = this.state.brushSize;
	}

	public setSmoothing(context) {
		context.mozImageSmoothingEnabled = false;
		context.webkitImageSmoothingEnabled = false;
		context.msImageSmoothingEnabled = false;
		context.imageSmoothingEnabled = false;
	}

	public getPointerPosition = (event) => {
		return {
			x: event.offsetX,
			y: event.offsetY
		};
	}

	public handleMouseDown = (event) => {
		const { x, y } = this.getPointerPosition(event.nativeEvent);
		this.prevMousePosition.x = this.currMousePosition.x = x;
		this.prevMousePosition.y = this.currMousePosition.y = y;
		this.isDrawing = true;
	}

	public handleMouseUp = () => {
		this.isDrawing = false;
	}

	public drawLine = (context, startPosition, endPosition) => {
		context.beginPath();
		context.moveTo(startPosition.x, startPosition.y);
		context.lineTo(endPosition.x, endPosition.y);
		context.lineJoin = context.lineCap = 'round';
		context.stroke();
	}

	public handleMouseMove = (event) => {
		this.currMousePosition = this.getPointerPosition(event.nativeEvent);

		if (this.isDrawing) {
			this.drawLine(this.canvasContext, this.prevMousePosition, this.currMousePosition);
		}

		this.prevMousePosition.x = this.currMousePosition.x;
		this.prevMousePosition.y = this.currMousePosition.y;
	}

	public componentDidMount() {
		this.setSmoothing(this.canvasContext);
		this.setBrushMode();
	}

	public render() {
		return (
			<Container>
				<ToolsContainer>
					<Button onClick={this.setBrushMode}>Pencil</Button>
					<Button onClick={this.setEraseMode}>Erase</Button>
				</ToolsContainer>
				<Canvas
					width={window.innerWidth * 0.8}
					height={window.innerHeight * 0.8}
					innerRef={this.canvasRef}
					onMouseDown={this.handleMouseDown}
					onTouchStart={this.handleMouseDown}
					onMouseUp={this.handleMouseUp}
					onTouchEnd={this.handleMouseUp}
					onMouseMove={this.handleMouseMove}
					onTouchMove={this.handleMouseMove}
				/>
			</Container>
		);
	}
}
