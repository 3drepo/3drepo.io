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
import { Layer } from 'react-konva';

import { ROUTES } from '../../../constants/routes';
import { aspectRatio } from '../../../helpers/aspectRatio';
import { renderWhenTrue } from '../../../helpers/rendering';
import { viewportSize } from '../../../helpers/viewportSize';
import { LoaderContainer } from '../../board/board.styles';
import { Loader } from '../loader/loader.component';
import { DrawingHandler } from './components/drawingHandler/drawingHandler.component';
import { DrawnLine } from './components/drawnLine/drawnLine.component';
import { Erasing } from './components/erasing/erasing.component';
import { Indicator } from './components/indicator/indicator.component';
import { Shape } from './components/shape/shape.component';
import { SHAPE_TYPES } from './components/shape/shape.constants';
import { TextNode } from './components/textNode/textNode.component';
import { Tools } from './components/tools/tools.component';
import { TypingHandler } from './components/typingHandler/typingHandler.component';
import {
	getNewDrawnLine, getNewShape, getNewText, ELEMENT_TYPES, INITIAL_VALUES, MODES
} from './screenshotDialog.helpers';
import { Container, Stage, StageContainer } from './screenshotDialog.styles';

const MIN_DIALOG_WIDTH = 860;
const MIN_DIALOG_HEIGHT = 300;
const INIT_DIALOG_HEIGHT = 600;
const INIT_DIALOG_PADDING = 48;
const HORIZONTAL_DIALOG_PADDING = 2 * INIT_DIALOG_PADDING;
const VERTICAL_DIALOG_PADDING = 40 - 2 * INIT_DIALOG_PADDING;

declare const Konva;

interface IProps {
	sourceImage: string | Promise<string>;
	disabled?: boolean;
	canvasElements: any[];
	arePastElements: boolean;
	areFutureElements: boolean;
	pathname: string;
	viewer: any;
	handleResolve: (screenshot) => void;
	handleClose: () => void;
	addElement: (element) => void;
	updateElement: (elementName, property) => void;
	removeElement: (elementName) => void;
	undo: () => void;
	redo: () => void;
	clearHistory: () => void;
	initHistory: () => void;
}

export class ScreenshotDialog extends React.PureComponent<IProps, any> {
	public state = {
		color: INITIAL_VALUES.color,
		strokeWidth: INITIAL_VALUES.brushSize,
		fontSize: INITIAL_VALUES.textSize,
		mode: null,
		activeShape: null,
		sourceImage: '',
		stage: {
			height: 0,
			width: 0,
		},
		container: {
			height: INIT_DIALOG_HEIGHT,
			width: MIN_DIALOG_WIDTH,
		},
		selectedObjectName: '',
	};

	public containerRef = React.createRef<any>();
	public layerRef = React.createRef<any>();
	public imageLayerRef = React.createRef<any>();
	public drawingLayerRef = React.createRef<any>();
	public stageRef = React.createRef<any>();

	public lastImageCanvasWidth = null;

	public get containerElement() {
		return this.containerRef.current;
	}

	public get layer() {
		return this.layerRef.current;
	}

	public get imageLayer() {
		return this.imageLayerRef.current;
	}

	public get drawingLayer() {
		return this.drawingLayerRef.current;
	}

	public get stage() {
		return this.stageRef.current;
	}

	public get isDrawingMode() {
		return this.state.mode === MODES.BRUSH || this.state.mode === MODES.ERASER;
	}

	public get isErasing() {
		return this.state.mode === MODES.ERASER;
	}

	public get selectedElementType() {
		const [elementType] = this.state.selectedObjectName.split('-');
		return elementType;
	}

	public renderIndicator = renderWhenTrue(() => (
		<Indicator color={this.state.color} size={this.state.strokeWidth} />
	));

	public renderErasing = renderWhenTrue(() => {
		return (
			<Erasing
				height={this.state.stage.height}
				width={this.state.stage.width}
				size={this.state.strokeWidth}
				color={this.state.color}
				mode={this.state.mode}
				layer={this.layerRef}
				stage={this.stage}
			/>
		);
	});

	public async componentDidMount() {
		const sourceImage = await this.props.sourceImage;

		const imageObj = new Image();
		imageObj.onload = () => {
			const image = new Konva.Image({
				image: imageObj,
			});
			this.scaleStage(image);

			this.imageLayer.add(image);
			this.imageLayer.batchDraw();
			this.lastImageCanvasWidth = this.imageLayer.canvas.width;
		};
		imageObj.src = sourceImage;

		this.setState({ sourceImage, mode: INITIAL_VALUES.mode });

		document.addEventListener('keydown', this.handleKeyDown);
		if (this.props.pathname.includes(ROUTES.VIEWER)) {
			this.props.viewer.pauseRendering();
		}

		if (this.layer) {
			this.clearCanvas();
		}
	}

	public componentDidUpdate(prevProps, prevState) {
		if (this.state.mode === MODES.SHAPE && prevState.mode !== MODES.SHAPE) {
			document.body.style.cursor = 'crosshair';
		}
	}

	public componentWillUnmount() {
		document.removeEventListener('keydown', this.handleKeyDown);
		if (this.props.pathname.includes(ROUTES.VIEWER)) {
			this.props.viewer.resumeRendering();
		}

		if (this.layer) {
			this.clearCanvas();
		}
	}

	public handleRefreshDrawingLayer = () => this.drawingLayer.getLayer().batchDraw();

	public get localPosition() {
		if (this.stage && this.layer) {
			const position = this.stage.getPointerPosition();
			return {
				x: position.x - this.layer.x(),
				y: position.y - this.layer.y()
			};
		}
		return {
			x: 0,
			y: 0
		};
	}

	public handleResize = () => {
		const backgroundImage = this.imageLayer.children[0];
		this.scaleStage(backgroundImage);
	}

	private updateDialogSizes = ({ height, width }) => {
		this.setState({
			container: {
				height: height >= MIN_DIALOG_HEIGHT ? height : MIN_DIALOG_HEIGHT,
				width: width >= MIN_DIALOG_WIDTH ? width : MIN_DIALOG_WIDTH,
			},
			stage: {
				height,
				width,
			}
		});
	}

	public scaleStage = (image) => {
		const { naturalWidth, naturalHeight } = image.attrs.image;
		const { width: viewportWidth, height: viewportHeight } = viewportSize();
		const maxHeight = viewportHeight - VERTICAL_DIALOG_PADDING;
		const maxWidth = viewportWidth - HORIZONTAL_DIALOG_PADDING;

		if (naturalWidth < maxWidth && naturalHeight < maxHeight) {
			this.updateDialogSizes({ height: naturalHeight, width: naturalWidth });
		} else {
			const { scaledWidth, scaledHeight } = aspectRatio(naturalWidth, naturalHeight, maxWidth, maxHeight);
			image.setAttrs({
				width: scaledWidth,
				height: scaledHeight,
			});
			this.updateDialogSizes({ height: scaledHeight, width: scaledWidth });
		}

		if (this.lastImageCanvasWidth) {
			const x = (this.imageLayer.canvas.width - this.lastImageCanvasWidth) / 2;

			this.layer.setAttrs({ x });
			this.drawingLayer.setAttrs({ x });
		} else {
			this.lastImageCanvasWidth = this.imageLayer.canvas.width;
		}
	}

	public handleChangeObject = (attrs) => {
		this.props.updateElement(attrs.name, attrs);
	}

	private updateProperty = (property: string, value: number) => {
		if (this.state.selectedObjectName) {
			this.props.updateElement(this.state.selectedObjectName, { [property]: value });
		}

		this.setState({
			[property]: value,
		});
	}

	public handleBrushSizeChange = ({ target: { value } }) => {
		this.updateProperty('strokeWidth', value);
	}

	public handleTextSizeChange = ({ target: { value } }) => {
		this.updateProperty('fontSize', value);
	}

	public handleColorChange = (color) => {
		this.updateProperty('color', color);
	}

	public clearCanvas = () => {
		this.layer.clear();
		this.drawingLayer.clear();
		this.stage.clearCache();
		this.layer.clearCache();
		this.drawingLayer.clearCache();
		this.layer.destroyChildren();
		this.drawingLayer.destroyChildren();

		// init before clear - it's on puporse because of library's bug;
		// the library doesn't clear current state, only past and future
		this.props.initHistory();
		this.props.clearHistory();
	}

	public handleSave = () => {
		this.setState({ selectedObjectName: '' }, async () => {
			const screenshot = await this.stage.toDataURL();
			this.props.handleResolve(screenshot);
		});
	}

	public setMode = (mode) => {
		const newState = {
			mode: this.state.mode === mode ? '' : mode
		} as any;

		if (this.state.selectedObjectName) {
			newState.selectedObjectName = '';
		}
		this.setState(() => newState);
	}

	public setBrushMode = () => this.setMode(MODES.BRUSH);

	public setEraserMode = () => this.setMode(MODES.ERASER);

	public setShapeMode = (shape) => {
		if ([SHAPE_TYPES.CALLOUT_DOT, SHAPE_TYPES.CALLOUT_CIRCLE, SHAPE_TYPES.CALLOUT_RECTANGLE].includes(shape)) {
			this.setState({
				activeShape: shape,
				mode: MODES.CALLOUT,
			});
			return;
		}

		if (shape === SHAPE_TYPES.POLYGON) {
			this.setState({
				activeShape: shape,
				mode: MODES.POLYGON,
			});
			return;
		}

		const newState = {
			activeShape: shape
		} as any;

		if (this.state.mode !== MODES.SHAPE) {
			newState.mode = MODES.SHAPE;
		}

		this.setState(newState);
	}

	public handleToolTextClick = () => {
		if (this.state.mode !==  MODES.TEXT) {
			this.setState({ mode: MODES.TEXT }, () => {
				document.body.style.cursor = 'crosshair';
			});
		} else {
			this.setState({ mode: '' }, () => {
				document.body.style.cursor = 'default';
			});
		}
	}

	public addNewText = (position, text?: string, updateState: boolean = true) => {
		if (!this.state.selectedObjectName) {
			position.y = position.y + 1;
			const newText = getNewText(this.state.color, this.state.fontSize, position, text);
			this.props.addElement(newText);

			if (updateState) {
				this.setState({
					selectedObjectName: newText.name,
					mode: MODES.TEXT,
				});
			}

			document.body.style.cursor = 'crosshair';
		}
	}

	public addNewDrawnLine = (line, type, updateState: boolean = true) => {
		if (!this.state.selectedObjectName) {
			const newLine = getNewDrawnLine(line.attrs, this.state.color, type);
			const selectedObjectName = this.isErasing ? '' : newLine.name;
			this.props.addElement(newLine);

			if (updateState) {
				if (type !== MODES.POLYGON) {
					this.setState(({mode}) => ({selectedObjectName, mode: this.isErasing ? mode : MODES.BRUSH}));
				} else {
					this.setState({selectedObjectName, mode: MODES.POLYGON});
				}
			}
		}
	}

	public addNewShape = (figure, { attrs }, updateState: boolean = true) => {
		if (!this.state.selectedObjectName) {
			const correctCircle = figure === SHAPE_TYPES.CIRCLE && attrs.radius > 1;
			const correctTriangle = figure === SHAPE_TYPES.TRIANGLE && attrs.radius > 1;
			const correctRectangle =
				figure === SHAPE_TYPES.RECTANGLE && (Math.abs(attrs.height) > 1 || Math.abs(attrs.width) > 1);
			const correctLineShape = [SHAPE_TYPES.LINE, SHAPE_TYPES.ARROW]
					.includes(figure) && attrs.points && attrs.points.length;
			const correctCustomShape = [SHAPE_TYPES.CLOUD]
					.includes(figure) && (Math.abs(attrs.scaleX) > 0 || Math.abs(attrs.scaleY) > 0);

			if (correctCircle || correctTriangle || correctRectangle || correctLineShape || correctCustomShape) {
				const { scaleX, scaleY, ...attributes } = attrs;
				const newShape = getNewShape(figure, this.state.color, {
					...attributes,
					initScaleX: scaleX,
					initScaleY: scaleY,
				});
				const selectedObjectName = newShape.name;
				this.props.addElement(newShape);
				if (updateState) {
					this.setState({ selectedObjectName });
				}
			}

			document.body.style.cursor = 'crosshair';
		}
	}

	public handleKeyDown = (e) => {
		if (this.state.selectedObjectName) {
			if (e.keyCode === 8) {
				this.props.removeElement(this.state.selectedObjectName);
				this.setState({
					selectedObjectName: ''
				}, () => {
					document.body.style.cursor = 'default';
				});
			}
		}
	}

	public renderObjects = () => this.props.canvasElements.map((element, index) => {
		const isSelected = this.state.selectedObjectName === element.name;
		const commonProps = {
			element,
			isSelected,
			handleChange: (newAttrs) => this.handleChangeObject(newAttrs),
		};

		if (element.type === ELEMENT_TYPES.TEXT) {
			return (<TextNode key={index} {...commonProps} />);
		} else if (element.type === ELEMENT_TYPES.DRAWING) {
			return (<DrawnLine key={index} {...commonProps} />);
		}
		return (<Shape key={index} {...commonProps} />);
	})

	public renderDrawingHandler = () => (
			<DrawingHandler
					height={this.state.stage.height}
					width={this.state.stage.width}
					size={this.state.strokeWidth}
					textSize={this.state.fontSize}
					color={this.state.color}
					mode={this.state.mode}
					layer={this.drawingLayerRef}
					stage={this.stage}
					handleNewDrawnLine={this.addNewDrawnLine}
					handleNewDrawnShape={this.addNewShape}
					handleNewText={this.addNewText}
					selected={this.state.selectedObjectName}
					activeShape={this.state.activeShape}
					disabled={this.props.disabled}
			/>
	)

	public renderLayers = () => {
		if (this.state.stage.width && this.state.stage.height) {
			return (
				<>
					<Layer ref={this.imageLayerRef} />
					<Layer ref={this.layerRef}>
						{this.renderObjects()}
						{this.renderErasing(this.isErasing)}
					</Layer>
					<Layer ref={this.drawingLayerRef} />
				</>
			);
		}
	}

	public renderTools = () => (
		<Tools
			size={this.state.strokeWidth}
			textSize={this.state.fontSize}
			color={this.state.color}
			onDrawClick={this.setBrushMode}
			onEraseClick={this.setEraserMode}
			onTextClick={this.handleToolTextClick}
			onShapeClick={this.setShapeMode}
			onClearClick={this.clearCanvas}
			onBrushSizeChange={this.handleBrushSizeChange}
			onTextSizeChange={this.handleTextSizeChange}
			onColorChange={this.handleColorChange}
			onUndo={this.props.undo}
			onRedo={this.props.redo}
			onSave={this.handleSave}
			disabled={this.props.disabled}
			mode={this.state.mode}
			activeShape={this.state.activeShape}
			selectedObjectName={this.state.selectedObjectName}
			arePastElements={this.props.arePastElements}
			areFutureElements={this.props.areFutureElements}
		/>
	)

	public handleStageMouseDown = ({ target }) => {
		const isAnchor = target && target.attrs.name && target.attrs.name.includes('anchor');
		const isSelectedObject = target.parent && (target.parent.attrs.name !== this.state.selectedObjectName);
		const isDrawnLine = target.attrs.type !== 'drawing' && target.attrs.name !== this.state.selectedObjectName;

		if (!target.parent || (isSelectedObject && isDrawnLine && !isAnchor)) {
			this.setState({ selectedObjectName: '' });
			return;
		}
	}

	public renderTypingHandler = () => (
		<TypingHandler
			mode={this.state.mode}
			stage={this.stage}
			layer={this.layer}
			color={this.state.color}
			fontSize={this.state.fontSize}
			onRefreshDrawingLayer={this.handleRefreshDrawingLayer}
			onAddNewText={this.addNewText}
			selected={this.state.selectedObjectName}
		/>
	)

	public renderLoader = renderWhenTrue(() => (
			<LoaderContainer>
				<Loader size={20} />
			</LoaderContainer>
	));

	public render() {
		const { stage, container } = this.state;

		return (
			<Container height={container.height} width={container.width} ref={this.containerRef}>
				<EventListener target="window" onResize={this.handleResize} />
				{this.renderTools()}
				{this.renderLoader(!stage.width || !stage.height)}
				<StageContainer height={stage.height} width={stage.width}>
					{this.renderIndicator(!this.props.disabled && this.isDrawingMode && !this.state.selectedObjectName)}
					<Stage
						id="stage"
						ref={this.stageRef}
						height={stage.height}
						width={stage.width}
						onMouseDown={this.handleStageMouseDown}
						onTouchStart={this.handleStageMouseDown}
					>
						{this.renderLayers()}
					</Stage>
					{this.renderDrawingHandler()}
					{this.renderTypingHandler()}
				</StageContainer>
			</Container>
		);
	}
}
