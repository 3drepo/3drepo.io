/**
 *  Copyright (C) 2024 3D Repo Ltd
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

/* eslint-disable max-classes-per-file */
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
import { PureComponent, createRef } from 'react';
import { WindowEventListener } from '@/v4/helpers/windowEventListener';
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

export class ScreenshotDialog extends PureComponent<IProps, any> {
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

	public containerRef = createRef<any>();
	public layerRef = createRef<any>();
	public imageLayerRef = createRef<any>();
	public drawingLayerRef = createRef<any>();
	public stageRef = createRef<any>();

	public lastImageCanvasWidth = null;

	public get containerElement() {
		return this.containerRef.current;
	}

	public async componentDidMount() {
		const sourceImage = await this.props.sourceImage;

		const imageObj = new Image();
		imageObj.onload = () => {
			const image = new Konva.Image({
				image: imageObj,
			});
			this.scaleStage(image);

			this.imageLayerRef.current.add(image);
			this.imageLayerRef.current.batchDraw();
			this.lastImageCanvasWidth = this.imageLayerRef.current.canvas.width;
		};
		imageObj.src = sourceImage;

		this.setState({ sourceImage, mode: INITIAL_VALUES.mode });

		document.addEventListener('keydown', this.handleKeyDown);
		if (this.props.pathname.includes(ROUTES.VIEWER)) {
			this.props.viewer.pauseRendering();
		}

		if (this.layerRef.current) {
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

		if (this.layerRef.current) {
			this.clearCanvas();
		}
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
			const x = (this.imageLayerRef.current.canvas.width - this.lastImageCanvasWidth) / 2;

			this.layerRef.current.setAttrs({ x });
			this.drawingLayerRef.current.setAttrs({ x });
		} else {
			this.lastImageCanvasWidth = this.imageLayerRef.current.canvas.width;
		}
	}

	public clearCanvas = () => {
		this.layerRef.current.clear();
		this.drawingLayerRef.current.clear();
		this.stageRef.current.clearCache();
		this.layerRef.current.clearCache();
		this.drawingLayerRef.current.clearCache();
		this.layerRef.current.destroyChildren();
		this.drawingLayerRef.current.destroyChildren();

		// init before clear - it's on puporse because of library's bug;
		// the library doesn't clear current state, only past and future
		// and then call again init to allow to undo
		this.props.initHistory();
		this.props.clearHistory();
		this.props.initHistory();
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

	public handleSave = () => {
		this.setState({ selectedObjectName: '' }, async () => {
			const screenshot = await this.stageRef.current.toDataURL();
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

	public renderLoader = renderWhenTrue(() => (
		<LoaderContainer>
			<Loader size={20} />
		</LoaderContainer>
	));

	public render() {
		const { stage, container } = this.state;

		return (
			<Container height={container.height} width={container.width} ref={this.containerRef}>
				{this.renderTools()}
				{this.renderLoader(!stage.width || !stage.height)}
				<MarkupStage
					disabled={this.props.disabled}
					updateElement={this.props.updateElement}
					canvasElements={this.props.canvasElements}
					addElement={this.props.addElement}

					stageRef={this.stageRef}
					layerRef={this.layerRef}
					imageLayerRef={this.imageLayerRef}
					drawingLayerRef={this.drawingLayerRef}
					scaleStage={this.scaleStage}

					activeShape={this.state.activeShape}
					color={this.state.color}
					selectedObjectName={this.state.selectedObjectName}
					strokeWidth={this.state.strokeWidth}
					mode={this.state.mode}
					stage={this.state.stage}
					fontSize={this.state.fontSize}
					onSetSelectedObjectName={(selectedObjectName) => this.setState({ selectedObjectName })}
					onModeChange={(mode) => this.setState({ mode })}
				/>
			</Container>
		);
	}
}

class MarkupStage extends PureComponent<{
	stageRef,
	color,
	strokeWidth,
	disabled,
	selectedObjectName,
	updateElement,
	imageLayerRef,
	layerRef,
	drawingLayerRef,
	canvasElements,
	mode,
	stage,
	fontSize,
	addElement,
	activeShape,
	onSetSelectedObjectName,
	onModeChange,
	scaleStage,
}, any> {
	public get isErasing() {
		return this.props.mode === MODES.ERASER;
	}

	public get isDrawingMode() {
		return this.props.mode === MODES.BRUSH || this.isErasing;
	}

	public handleStageMouseDown = ({ target }) => {
		const isAnchor = target && target.attrs.name && target.attrs.name.includes('anchor');
		const isSelectedObject = target.parent && (target.parent.attrs.name !== this.props.selectedObjectName);
		const isDrawnLine = target.attrs.type !== 'drawing' && target.attrs.name !== this.props.selectedObjectName;

		if (!target.parent || (isSelectedObject && isDrawnLine && !isAnchor)) {
			this.props.onSetSelectedObjectName('');
			return;
		}
	}

	public addNewText = (position, text?: string, updateState: boolean = true) => {
		if (!this.props.selectedObjectName) {
			position.y = position.y + 1;
			const newText = getNewText(this.props.color, this.props.fontSize, position, text);
			this.props.addElement(newText);

			if (updateState) {
				this.props.onSetSelectedObjectName(newText.name);
				this.props.onModeChange(MODES.TEXT);
				// this.setState({
				// 	selectedObjectName: newText.name,
				// 	mode: MODES.TEXT,
				// });
			}

			document.body.style.cursor = 'crosshair';
		}
	}

	public addNewShape = (figure, { attrs }, updateState: boolean = true) => {
		if (!this.props.selectedObjectName) {
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
				const newShape = getNewShape(figure, this.props.color, {
					...attributes,
					initScaleX: scaleX,
					initScaleY: scaleY,
				});
				const selectedObjectName = newShape.name;
				this.props.addElement(newShape);
				if (updateState) {
					this.props.onSetSelectedObjectName(selectedObjectName);
				}
			}

			document.body.style.cursor = 'crosshair';
		}
	}

	public addNewDrawnLine = (line, type, updateState: boolean = true) => {
		if (!this.props.selectedObjectName) {
			const newLine = getNewDrawnLine(line.attrs, this.props.color, type);
			const selectedObjectName = this.isErasing ? '' : newLine.name;
			this.props.addElement(newLine);

			if (updateState) {
				this.props.onSetSelectedObjectName(selectedObjectName);
				if (type !== MODES.POLYGON) {
					this.props.onModeChange(this.isErasing ? this.props.mode : MODES.BRUSH);
				} else {
					this.props.onModeChange(MODES.POLYGON);
				}
			}
		}
	}

	public handleResize = () => {
		const backgroundImage = this.props.imageLayerRef.current.children[0];
		this.props.scaleStage(backgroundImage);
	}

	public renderIndicator = renderWhenTrue(() => (
		<Indicator color={this.props.color} size={this.props.strokeWidth} />
	));

	public renderObjects = () => this.props.canvasElements.map((element, index) => {
		const isSelected = this.props.selectedObjectName === element.name;
		const commonProps = {
			element,
			isSelected,
			handleChange: (newAttrs) => this.props.updateElement(newAttrs.name, newAttrs),
		};

		if (element.type === ELEMENT_TYPES.TEXT) {
			return (<TextNode key={index} {...commonProps} />);
		} else if (element.type === ELEMENT_TYPES.DRAWING) {
			return (<DrawnLine key={index} {...commonProps} />);
		}
		return (<Shape key={index} {...commonProps} />);
	})

	public renderErasing = renderWhenTrue(() => {
		return (
			<Erasing
				height={this.props.stage.height}
				width={this.props.stage.width}
				size={this.props.strokeWidth}
				color={this.props.color}
				mode={this.props.mode}
				layer={this.props.layerRef}
				stage={this.props.stageRef.current}
			/>
		);
	});

	public renderLayers = () => {
		if (this.props.stage.width && this.props.stage.height) {
			return (
				<>
					<Layer ref={this.props.imageLayerRef} />
					<Layer ref={this.props.layerRef}>
						{this.renderObjects()}
						{this.renderErasing(this.isErasing)}
					</Layer>
					<Layer ref={this.props.drawingLayerRef} />
				</>
			);
		}
	}

	public renderDrawingHandler = () => (
		<DrawingHandler
			height={this.props.stage.height}
			width={this.props.stage.width}
			size={this.props.strokeWidth}
			textSize={this.props.fontSize}
			color={this.props.color}
			mode={this.props.mode}
			layer={this.props.drawingLayerRef}
			stage={this.props.stageRef.current}
			handleNewDrawnLine={this.addNewDrawnLine}
			handleNewDrawnShape={this.addNewShape}
			handleNewText={this.addNewText}
			selected={this.props.selectedObjectName}
			activeShape={this.props.activeShape}
			disabled={this.props.disabled}
		/>
	)

	public handleRefreshDrawingLayer = () => this.props.drawingLayerRef.current.getLayer().batchDraw();

	public renderTypingHandler = () => (
		<TypingHandler
			mode={this.props.mode}
			stage={this.props.stageRef.current}
			layer={this.props.layerRef.current}
			color={this.props.color}
			fontSize={this.props.fontSize}
			onRefreshDrawingLayer={this.handleRefreshDrawingLayer}
			onAddNewText={this.addNewText}
			selected={this.props.selectedObjectName}
		/>
	)

	render() {
		return (
			<StageContainer height={this.props.stage.height} width={this.props.stage.width}>
				<WindowEventListener event='resize' onEventTriggered={this.handleResize} />
				{this.renderIndicator(!this.props.disabled && this.isDrawingMode && !this.props.selectedObjectName)}
				<Stage
					id="stage"
					ref={this.props.stageRef}
					height={this.props.stage.height}
					width={this.props.stage.width}
					onMouseDown={this.handleStageMouseDown}
					onTouchStart={this.handleStageMouseDown}
				>
					{this.renderLayers()}
				</Stage>
				{this.renderDrawingHandler()}
				{this.renderTypingHandler()}
			</StageContainer>
		);
	}
};
