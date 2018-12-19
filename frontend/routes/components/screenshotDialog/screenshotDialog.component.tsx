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
import EventListener from 'react-event-listener';

import { Container, Canvas, BackgroundImage, HiddenCanvas } from './screenshotDialog.styles';
import { COLOR } from '../../../styles';
import { Indicator } from './components/indicator/indicator.component';
import { loadImage } from '../../../helpers/images';
import { getPointerPosition } from '../../../helpers/events';
import { renderWhenTrue } from '../../../helpers/rendering';
import { Tools } from './components/tools/tools.component';

interface IProps {
	sourceImage: string | Promise<string>;
	disabled?: boolean;
	handleResolve: (screenshot) => void;
	handleClose: () => void;
}

export class ScreenshotDialog extends React.PureComponent<IProps, any> {
	public state = {
		color: COLOR.RED,
		brushSize: 5,
		sourceImage: ''
	};

	public isDrawing;
	public prevMousePosition = { x: 0, y: 0 };
	public currMousePosition = { x: 0, y: 0 };

	public containerRef = React.createRef<any>();
	public canvasRef = React.createRef<any>();
	public brushRef = React.createRef<any>();
	public toolsRef = React.createRef<any>();
	public hiddenCanvasRef = React.createRef<any>();

	get containerElement() {
		return this.containerRef.current;
	}

	get hiddenCanvas() {
		return this.hiddenCanvasRef.current as any;
	}

	get canvas() {
		return this.canvasRef.current as any;
	}

	get canvasContext() {
		return this.canvas.getContext('2d');
	}

	get brushElement() {
		return this.brushRef.current;
	}

	get toolsElement() {
		return this.toolsRef.current;
	}

	public setCanvasSize = () => {
		const width = this.containerElement.offsetWidth;
		const height = this.containerElement.offsetHeight;
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.style.width = width;
		this.canvas.style.height = height;
	}

	public setBrushMode = () => {
		this.canvasContext.globalCompositeOperation = 'source-over';
		this.canvasContext.strokeStyle = this.state.color;
		this.canvasContext.lineWidth = this.state.brushSize;
	}

	public setEraseMode = () => {
		this.canvasContext.globalCompositeOperation = 'destination-out';
		this.canvasContext.lineWidth = this.state.brushSize;

		this.setState({ color: COLOR.WHITE });
	}

	public setSmoothing(context) {
		context.mozImageSmoothingEnabled = false;
		context.webkitImageSmoothingEnabled = false;
		context.msImageSmoothingEnabled = false;
		context.imageSmoothingEnabled = false;
	}

	public handleMouseDown = (event) => {
		if (!this.props.disabled) {
			const { x, y } = getPointerPosition(event.nativeEvent);
			this.prevMousePosition.x = this.currMousePosition.x = x;
			this.prevMousePosition.y = this.currMousePosition.y = y;
			this.isDrawing = true;

			this.toolsElement.style.pointerEvents = 'none';
			this.toolsElement.style.opacity = .2;
		}
	}

	public handleMouseUp = () => {
		if (!this.props.disabled) {
			this.isDrawing = false;

			this.toolsElement.style.pointerEvents = 'auto';
			this.toolsElement.style.opacity = 1;
		}
	}

	public drawLine = (context, startPosition, endPosition) => {
		context.beginPath();
		context.moveTo(startPosition.x, startPosition.y);
		context.lineTo(endPosition.x, endPosition.y);
		context.lineJoin = context.lineCap = 'round';
		context.stroke();
	}

	public handleMouseMove = (event) => {
		this.currMousePosition = getPointerPosition(event.nativeEvent);

		if (this.isDrawing) {
			this.drawLine(this.canvasContext, this.prevMousePosition, this.currMousePosition);
		}

		this.prevMousePosition.x = this.currMousePosition.x;
		this.prevMousePosition.y = this.currMousePosition.y;
	}

	public handleColorChange = (color) => {
		this.setState({color}, this.setBrushMode);
	}

	public handleBrushSizeChange = (event) => {
		this.setState({brushSize: event.target.value}, () => {
			this.canvasContext.lineWidth = this.state.brushSize;
		});
	}

	public clearCanvas = () => {
		this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	public handleSave = async () => {
		const hiddenCanvasContext = this.hiddenCanvas.getContext('2d');
		const { width, height } = this.canvas;
		const screenshotImage = await loadImage(this.state.sourceImage) as any;
		const imageRatio = screenshotImage.height / screenshotImage.width;
		const destImageHeight = width * imageRatio;

		this.hiddenCanvas.width = width;
		this.hiddenCanvas.height = height;
		hiddenCanvasContext.drawImage(
			screenshotImage,
			(this.hiddenCanvas.width - width) / 2,
			(this.hiddenCanvas.height - destImageHeight) / 2,
			width,
			destImageHeight
		);
		hiddenCanvasContext.drawImage(this.canvas, 0, 0);

		const screenshot = this.hiddenCanvas.toDataURL('image/png');
		this.props.handleResolve(screenshot);
	}

	public handleResize = async () => {
		const image = await loadImage(this.canvas.toDataURL('image/png')) as any;
		this.setCanvasSize();

		this.canvasContext.drawImage(
			image, 0, 0, image.width, image.height,
			0, 0, this.canvas.width, this.canvas.height
		);

		this.setBrushMode();
	}

	public async componentDidMount() {
		const sourceImage = await Promise.resolve(this.props.sourceImage);

		this.setState({ sourceImage }, () => {
			this.setCanvasSize();
			this.setSmoothing(this.canvasContext);
			this.setBrushMode();
		});
	}

	public renderIndicator = renderWhenTrue(() => (
		<Indicator color={this.state.color} size={this.state.brushSize} />
	));

	public renderTools = () => (
		<Tools
			innerRef={this.toolsRef}
			size={this.state.brushSize}
			color={this.state.color}
			onDrawClick={this.setBrushMode}
			onEraseClick={this.setEraseMode}
			onClearClick={this.clearCanvas}
			onBrushSizeChange={this.handleBrushSizeChange}
			onColorChange={this.handleColorChange}
			onCancel={this.props.handleClose}
			onSave={this.handleSave}
			disabled={this.props.disabled}
		/>
	)

	public render() {
		const { sourceImage } = this.state;

		return (
			<Container innerRef={this.containerRef}>
				<EventListener target="window" onResize={this.handleResize} />
				<HiddenCanvas innerRef={this.hiddenCanvasRef} />
				<BackgroundImage src={sourceImage} />
				{this.renderIndicator(!this.props.disabled)}
				{this.renderTools()}
				<Canvas
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
