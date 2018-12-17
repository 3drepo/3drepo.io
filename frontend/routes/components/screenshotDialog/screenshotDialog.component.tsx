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
import CanvasDraw from 'react-canvas-draw';
import { LazyBrush } from 'lazy-brush';
import { Catenary } from 'catenary-curve';

import { Container, Canvas } from './screenshotDialog.styles';
import Button from '@material-ui/core/Button';

interface IProps {
	image: string;
	onSave: (screenshot) => void;
}

export class ScreenshotDialog extends React.PureComponent<IProps, any> {
	public state = {
		color: '#00ff00',
		isErase: false,
		brushSize: 5
	};

	public isDrawing;

	public canvasRef = React.createRef();
	public brushRef = React.createRef();

	public innerWidth;
	public innerHeight;

	public prevMousePosition = { x: 0, y: 0 };
	public currMousePosition = { x: 0, y: 0 };
	public canvasOffset = { x: 0, y: 0 };

	get canvas() {
		return this.canvasRef.current as any;
	}

	get canvasContext() {
		return this.canvas.getContext('2d');
	}

	get brushElement() {
		return this.brushRef.current;
	}

	public handleErase = () => {
		this.setState({
			isErase: true
		});
	}

	public setSize() {
		this.innerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		this.innerHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

		this.canvas.width = (this.innerWidth * 80) / 100;
		this.canvas.height = (this.innerHeight * 80) / 100;
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

	public handleMouseDown = (e) => {
		const { x, y } = this.getPointerPosition(e.nativeEvent);
		this.prevMousePosition.x = this.currMousePosition.x = x;
		this.prevMousePosition.y = this.currMousePosition.y = y;
		this.isDrawing = true;
	}

	public handleMouseUp = (e) => {
		this.isDrawing = false;
	}

	public handleMouseMove = (e) => {
		this.currMousePosition = this.getPointerPosition(e.nativeEvent);

		if (this.isDrawing) {
				this.canvasContext.beginPath();
				if (!this.state.isErase) {
						this.canvasContext.globalCompositeOperation = 'source-over';
						this.canvasContext.strokeStyle = 'black';
						this.canvasContext.lineWidth = 3;
				} else {
						this.canvasContext.globalCompositeOperation = 'destination-out';
						this.canvasContext.lineWidth = 10;
				}
				this.canvasContext.moveTo(this.prevMousePosition.x, this.prevMousePosition.y);
				this.canvasContext.lineTo(this.currMousePosition.x, this.currMousePosition.y);
				this.canvasContext.lineJoin = this.canvasContext.lineCap = 'round';
				this.canvasContext.stroke();
		}
		this.prevMousePosition.x = this.currMousePosition.x;
		this.prevMousePosition.y = this.currMousePosition.y;
	}

	public componentDidMount() {
		this.setSmoothing(this.canvasContext);
		//sthis.setSize();
		this.canvasOffset.x = this.canvas.offsetLeft;
		this.canvasOffset.y = this.canvas.offsetTop;
	}

	public render() {
		return (
			<Container>
				<Button>Pencil</Button>
				<Button onClick={this.handleErase}>Erase</Button>
				<div ref={this.brushRef}>test</div>
				<Canvas
					width={600}
					height={600}

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
