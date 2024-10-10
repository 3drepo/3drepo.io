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

import { PureComponent, createRef } from 'react';
import { WindowEventListener } from '@/v4/helpers/windowEventListener';
import { Layer } from 'react-konva';

import { IFontSize, IShapeType, IMode, IStrokeWidth, ICalloutType } from '@components/shared/modalsDispatcher/templates/imagesModal/imageMarkup/imageMarkup.types';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { CanvasHistoryActions, selectAreFutureElements, selectArePastElements, selectCanvasElements } from '@/v4/modules/canvasHistory';
import { selectPathname } from '@/v4/modules/router/router.selectors';
import { withViewer } from '@/v4/services/viewer/viewer';
import { bindActionCreators } from 'redux';
import { COLOR } from '@/v4/styles';
import { downloadAuthUrl } from '@/v5/helpers/download.helper';
import { ROUTES } from '../../../../constants/routes';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { DrawingHandler } from '../components/drawingHandler/drawingHandler.component';
import { DrawnLine } from '../components/drawnLine/drawnLine.component';
import { Erasing } from '../components/erasing/erasing.component';
import { Indicator } from '../components/indicator/indicator.component';
import { Shape } from '../components/shape/shape.component';
import { SHAPE_TYPES } from '../components/shape/shape.constants';
import { TextNode } from '../components/textNode/textNode.component';
import { TypingHandler } from '../components/typingHandler/typingHandler.component';
import { getNewDrawnLine, getNewShape, getNewText, ELEMENT_TYPES, MODES } from './markupStage.helpers';
import { Stage, StageContainer } from './markupStage.styles';

declare const Konva;

export type MarkupRefObject = {
	getScreenshot: () => Promise<string>,
	clearCanvas: () => void,
}
type MarkupStageProps = {
	sourceImage: string;
	disabled?: boolean;
	sizes: { height: number, width: number };
	onScaleStage?: (image) => void
	markupRef: React.MutableRefObject<MarkupRefObject>,
	activeShape: IShapeType | ICalloutType,
	color: string,
	selectedObjectName: string,
	strokeWidth: IStrokeWidth,
	mode: IMode,
	fontSize: IFontSize,
	onSelectedObjectNameChange: (name: string) => void,
	onModeChange: (mode: IMode) => void,
	onCursorChange?: (cursor: 'crosshair' | 'default') => void,
}
interface IProps extends MarkupStageProps {
	// props passed by 'container'
	canvasElements: any[];
	pathname: string;
	viewer: any;
	addElement: (element) => void;
	updateElement: (elementName, property) => void;
	removeElement: (elementName) => void;
	clearHistory: () => void;
	initHistory: () => void;
}
class BaseMarkupStage extends PureComponent<IProps, any> {
	public imageLayerRef = createRef<any>();
	public layerRef = createRef<any>();
	public drawingLayerRef = createRef<any>();
	public stageRef = createRef<any>();
	public lastImageCanvasWidthRef = createRef<any>() as React.MutableRefObject<any>;

	public get isErasing() {
		return this.props.mode === MODES.ERASER;
	}

	public get isDrawingMode() {
		return this.props.mode === MODES.BRUSH || this.isErasing;
	}

	public async componentDidMount() {
		const imageObj = new Image();
		imageObj.onload = () => {
			const image = new Konva.Image({ image: imageObj });
			this.scaleStage(image);

			this.imageLayerRef.current.add(image);
			this.imageLayerRef.current.batchDraw();
			this.lastImageCanvasWidthRef.current = this.imageLayerRef.current.canvas.width;

			this.props.markupRef.current = this;
		};

		imageObj.src = await downloadAuthUrl(this.props.sourceImage);

		document.addEventListener('keydown', this.handleKeyDown);
		if (this.props.pathname.includes(ROUTES.VIEWER)) {
			this.props.viewer.pauseRendering();
		}

		if (this.layerRef.current) {
			this.clearCanvas();
		}

		this.props.markupRef.current = {
			getScreenshot: this.getScreenshot,
			clearCanvas: this.clearCanvas,
		};
	}

	public componentDidUpdate(prevProps) {
		if (this.props.mode === MODES.SHAPE && prevProps.mode !== MODES.SHAPE) {
			this.props.onCursorChange?.('crosshair');
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

	public async getScreenshot() {
		return this.stageRef.current.toDataURL();
	}

	public handleKeyDown = (e) => {
		if (this.props.selectedObjectName && e.keyCode === 8) {
			this.props.removeElement(this.props.selectedObjectName);
			this.props.onSelectedObjectNameChange('');
		}
	}

	public scaleStage = (image) => {
		this.props.onScaleStage?.(image)
		if (this.lastImageCanvasWidthRef.current) {
			const x = (this.imageLayerRef.current.canvas.width - this.lastImageCanvasWidthRef.current) / 2;

			this.layerRef.current.setAttrs({ x });
			this.drawingLayerRef.current.setAttrs({ x });
		} else {
			this.lastImageCanvasWidthRef.current = this.imageLayerRef.current.canvas.width;
		}
	}

	public handleStageMouseDown = ({ target }) => {
		const isAnchor = target && target.attrs.name && target.attrs.name.includes('anchor');
		const isSelectedObject = target.parent && (target.parent.attrs.name !== this.props.selectedObjectName);
		const isDrawnLine = target.attrs.type !== 'drawing' && target.attrs.name !== this.props.selectedObjectName;

		if (!target.parent || (isSelectedObject && isDrawnLine && !isAnchor)) {
			this.props.onSelectedObjectNameChange('');
			return;
		}
	}

	public addNewText = (position, text?: string, updateState: boolean = true) => {
		if (!this.props.selectedObjectName) {
			position.y = position.y + 1;
			const newText = getNewText(this.props.color, this.props.fontSize, position, text);
			this.props.addElement(newText);

			if (updateState) {
				this.props.onSelectedObjectNameChange(newText.name);
				this.props.onModeChange(MODES.TEXT);
			}

			this.props.onCursorChange?.('crosshair');
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
					this.props.onSelectedObjectNameChange(selectedObjectName);
				}
			}

			this.props.onCursorChange?.('crosshair');
		}
	}

	public addNewDrawnLine = (line, type, updateState: boolean = true) => {
		if (!this.props.selectedObjectName) {
			const newLine = getNewDrawnLine(line.attrs, this.isErasing ? COLOR.WHITE : this.props.color, type);
			const selectedObjectName = this.isErasing ? '' : newLine.name;
			this.props.addElement(newLine);

			if (updateState) {
				this.props.onSelectedObjectNameChange(selectedObjectName);
				if (type !== MODES.POLYGON) {
					this.props.onModeChange(this.isErasing ? this.props.mode : MODES.BRUSH);
				} else {
					this.props.onModeChange(MODES.POLYGON);
				}
			}
		}
	}

	public handleResize = () => {
		const backgroundImage = this.imageLayerRef.current.children[0];
		this.scaleStage(backgroundImage);
	}

	public renderIndicator = renderWhenTrue(() => (
		<Indicator color={this.props.color} size={this.props.strokeWidth} isEraser={this.isErasing} />
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
				height={this.props.sizes.height}
				width={this.props.sizes.width}
				size={this.props.strokeWidth}
				mode={this.props.mode}
				layer={this.layerRef}
				stage={this.stageRef.current}
			/>
		);
	});

	public renderLayers = () => {
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

	public renderDrawingHandler = renderWhenTrue(() => (
		<DrawingHandler
			height={this.props.sizes.height}
			width={this.props.sizes.width}
			size={this.props.strokeWidth}
			textSize={this.props.fontSize}
			color={this.props.color}
			mode={this.props.mode}
			layer={this.drawingLayerRef}
			stage={this.stageRef.current}
			handleNewDrawnLine={this.addNewDrawnLine}
			handleNewDrawnShape={this.addNewShape}
			handleNewText={this.addNewText}
			selected={this.props.selectedObjectName}
			activeShape={this.props.activeShape}
			disabled={this.props.disabled}
		/>
	));

	public handleRefreshDrawingLayer = () => this.drawingLayerRef.current.getLayer().batchDraw();

	public renderTypingHandler = renderWhenTrue	(() => (
		<TypingHandler
			mode={this.props.mode}
			stage={this.stageRef.current}
			layer={this.layerRef.current}
			color={this.props.color}
			fontSize={this.props.fontSize}
			onRefreshDrawingLayer={this.handleRefreshDrawingLayer}
			onAddNewText={this.addNewText}
			selected={this.props.selectedObjectName}
		/>
	));

	render() {
		return (
			<StageContainer height={this.props.sizes.height} width={this.props.sizes.width}>
				<WindowEventListener event='resize' onEventTriggered={this.handleResize} />
				{this.renderIndicator(!this.props.disabled && this.isDrawingMode && !this.props.selectedObjectName)}
				<Stage
					id="stage"
					ref={this.stageRef}
					height={this.props.sizes.height}
					width={this.props.sizes.width}
					onMouseDown={this.handleStageMouseDown}
					onTouchStart={this.handleStageMouseDown}
				>
					{this.renderLayers()}
				</Stage>
				{this.renderDrawingHandler(this.stageRef.current)}
				{this.renderTypingHandler(this.stageRef.current)}
			</StageContainer>
		);
	}
};

// Equivalent of MarkupStage.container
const mapStateToProps = createStructuredSelector({
	canvasElements: selectCanvasElements,
	arePastElements: selectArePastElements,
	areFutureElements: selectAreFutureElements,
	pathname: selectPathname,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
	addElement: CanvasHistoryActions.add,
	updateElement: CanvasHistoryActions.update,
	removeElement: CanvasHistoryActions.remove,
	clearHistory: CanvasHistoryActions.clearHistory,
	initHistory: CanvasHistoryActions.initHistory
}, dispatch);

export const MarkupStage = withViewer(connect(mapStateToProps, mapDispatchToProps)(BaseMarkupStage)) as (props: MarkupStageProps) => any;
