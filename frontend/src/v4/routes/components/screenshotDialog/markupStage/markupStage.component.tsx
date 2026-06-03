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

import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { WindowEventListener } from '@/v4/helpers/windowEventListener';
import { Layer } from 'react-konva';

import { IFontSize, IShapeType, IMode, IStrokeWidth, ICalloutType } from '@components/shared/modalsDispatcher/templates/imagesModal/imageMarkup/imageMarkup.types';
import { useDispatch, useSelector } from 'react-redux';
import { CanvasHistoryActions, selectCanvasElements } from '@/v4/modules/canvasHistory';
import { selectPathname } from '@/v4/modules/router/router.selectors';
import { withViewer } from '@/v4/services/viewer/viewer';
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
	viewer: any;
}
const BaseMarkupStage = ({
	sourceImage,
	disabled,
	sizes,
	onScaleStage,
	markupRef,
	activeShape,
	color,
	selectedObjectName,
	strokeWidth,
	mode,
	fontSize,
	onSelectedObjectNameChange,
	onModeChange,
	onCursorChange,
	viewer,
}: IProps) => {
	const dispatch = useDispatch();
	const canvasElements = useSelector(selectCanvasElements);
	const pathname = useSelector(selectPathname);

	const imageLayerRef = useRef<any>(null);
	const layerRef = useRef<any>(null);
	const drawingLayerRef = useRef<any>(null);
	const stageRef = useRef<any>(null);
	const lastImageCanvasWidthRef = useRef<any>(null);
	const previousModeRef = useRef<IMode>(mode);

	const isErasing = mode === MODES.ERASER;
	const isDrawingMode = mode === MODES.BRUSH || isErasing;

	const addElement = useCallback((element) => dispatch(CanvasHistoryActions.add(element)), [dispatch]);
	const updateElement = useCallback((elementName, property) => {
		dispatch(CanvasHistoryActions.update(elementName, property));
	}, [dispatch]);
	const removeElement = useCallback((elementName) => dispatch(CanvasHistoryActions.remove(elementName)), [dispatch]);
	const clearHistory = useCallback(() => dispatch(CanvasHistoryActions.clearHistory()), [dispatch]);
	const initHistory = useCallback(() => dispatch(CanvasHistoryActions.initHistory()), [dispatch]);

	const clearCanvas = useCallback(() => {
		if (!layerRef.current || !drawingLayerRef.current || !stageRef.current) {
			return;
		}

		layerRef.current.clear();
		drawingLayerRef.current.clear();
		stageRef.current.clearCache();
		layerRef.current.clearCache();
		drawingLayerRef.current.clearCache();
		layerRef.current.destroyChildren();
		drawingLayerRef.current.destroyChildren();

		// init before clear - it's on puporse because of library's bug;
		// the library doesn't clear current state, only past and future
		// and then call again init to allow to undo
		initHistory();
		clearHistory();
		initHistory();
	}, [clearHistory, initHistory]);

	const getScreenshot = useCallback(async () => {
		return stageRef.current.toDataURL();
	}, []);

	const scaleStage = useCallback((image) => {
		onScaleStage?.(image)
		if (lastImageCanvasWidthRef.current) {
			const x = (imageLayerRef.current.canvas.width - lastImageCanvasWidthRef.current) / 2;

			layerRef.current.setAttrs({ x });
			drawingLayerRef.current.setAttrs({ x });
		} else {
			lastImageCanvasWidthRef.current = imageLayerRef.current.canvas.width;
		}
	}, [onScaleStage]);

	const handleKeyDown = useCallback((e) => {
		if (selectedObjectName && e.keyCode === 8) {
			removeElement(selectedObjectName);
			onSelectedObjectNameChange('');
		}
	}, [onSelectedObjectNameChange, removeElement, selectedObjectName]);

	const handleStageMouseDown = useCallback(({ target }) => {
		const isAnchor = target && target.attrs.name && target.attrs.name.includes('anchor');
		const isSelectedObject = target.parent && (target.parent.attrs.name !== selectedObjectName);
		const isDrawnLine = target.attrs.type !== 'drawing' && target.attrs.name !== selectedObjectName;

		if (!target.parent || (isSelectedObject && isDrawnLine && !isAnchor)) {
			onSelectedObjectNameChange('');
			return;
		}
	}, [onSelectedObjectNameChange, selectedObjectName]);

	const addNewText = useCallback((position, text: string, width?: number, updateState: boolean = true) => {
		if (!selectedObjectName) {
			position.y = position.y + 1;
			const newText = getNewText(color, fontSize, position, text, width);
			addElement(newText);

			if (updateState) {
				onSelectedObjectNameChange(newText.name);
				onModeChange(MODES.TEXT);
			}

			onCursorChange?.('crosshair');
		}
	}, [addElement, color, fontSize, onCursorChange, onModeChange, onSelectedObjectNameChange, selectedObjectName]);

	const addNewShape = useCallback((figure, { attrs }, updateState: boolean = true) => {
		if (!selectedObjectName) {
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
				const newShape = getNewShape(figure, color, {
					...attributes,
					initScaleX: scaleX,
					initScaleY: scaleY,
				});
				const selectedName = newShape.name;
				addElement(newShape);
				if (updateState) {
					onSelectedObjectNameChange(selectedName);
				}
			}

			onCursorChange?.('crosshair');
		}
	}, [addElement, color, onCursorChange, onSelectedObjectNameChange, selectedObjectName]);

	const addNewDrawnLine = useCallback((line, type, updateState: boolean = true) => {
		if (!selectedObjectName) {
			const newLine = getNewDrawnLine(line.attrs, isErasing ? COLOR.WHITE : color, type);
			const selectedName = isErasing ? '' : newLine.name;
			addElement(newLine);

			if (updateState) {
				onSelectedObjectNameChange(selectedName);
				if (type !== MODES.POLYGON) {
					onModeChange(isErasing ? mode : MODES.BRUSH);
				} else {
					onModeChange(MODES.POLYGON);
				}
			}
		}
	}, [addElement, color, isErasing, mode, onModeChange, onSelectedObjectNameChange, selectedObjectName]);

	const handleResize = useCallback(() => {
		const backgroundImage = imageLayerRef.current?.children[0];
		if (backgroundImage) {
			scaleStage(backgroundImage);
		}
	}, [scaleStage]);

	const handleRefreshDrawingLayer = useCallback(() => drawingLayerRef.current.getLayer().batchDraw(), []);

	const canvasObjects = useMemo(() => canvasElements.map((element, index) => {
		const isSelected = selectedObjectName === element.name;
		const commonProps = {
			element,
			isSelected,
			handleChange: (newAttrs) => updateElement(newAttrs.name, newAttrs),
		};

		if (element.type === ELEMENT_TYPES.TEXT) {
			return (<TextNode key={index} {...commonProps} />);
		} else if (element.type === ELEMENT_TYPES.DRAWING) {
			return (<DrawnLine key={index} {...commonProps} />);
		}
		return (<Shape key={index} {...commonProps} />);
	}), [canvasElements, selectedObjectName, updateElement]);

	useEffect(() => {
		const imageObj = new Image();
		let isMounted = true;

		imageObj.onload = () => {
			if (!isMounted || !imageLayerRef.current) {
				return;
			}

			const image = new Konva.Image({ image: imageObj });
			scaleStage(image);

			imageLayerRef.current.destroyChildren();
			imageLayerRef.current.add(image);
			imageLayerRef.current.batchDraw();
			lastImageCanvasWidthRef.current = imageLayerRef.current.canvas.width;

			markupRef.current = {
				getScreenshot,
				clearCanvas,
			};
		};

		const loadImage = async () => {
			imageObj.src = await downloadAuthUrl(sourceImage);
		};

		loadImage();

		return () => {
			isMounted = false;
			imageObj.onload = null;
		};
	}, [clearCanvas, getScreenshot, markupRef, scaleStage, sourceImage]);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	useEffect(() => {
		if (pathname.includes(ROUTES.VIEWER)) {
			viewer.pauseRendering();
			return () => viewer.resumeRendering();
		}
	}, [pathname, viewer]);

	useEffect(() => {
		if (layerRef.current) {
			clearCanvas();
		}

		return () => {
			if (layerRef.current) {
				clearCanvas();
			}
		};
	}, [clearCanvas]);

	useEffect(() => {
		markupRef.current = {
			getScreenshot,
			clearCanvas,
		};
	}, [clearCanvas, getScreenshot, markupRef]);

	useEffect(() => {
		if (mode === MODES.SHAPE && previousModeRef.current !== MODES.SHAPE) {
			onCursorChange?.('crosshair');
		}
		previousModeRef.current = mode;
	}, [mode, onCursorChange]);

	const renderIndicator = renderWhenTrue(() => (
		<Indicator color={color} size={strokeWidth} isEraser={isErasing} />
	));

	const renderErasing = renderWhenTrue(() => (
		<Erasing
			height={sizes.height}
			width={sizes.width}
			size={strokeWidth}
			mode={mode}
			layer={layerRef}
			stage={stageRef.current}
		/>
	));

	const renderDrawingHandler = renderWhenTrue(() => (
		<DrawingHandler
			height={sizes.height}
			width={sizes.width}
			size={strokeWidth}
			textSize={fontSize}
			color={color}
			mode={mode}
			layer={drawingLayerRef}
			stage={stageRef.current}
			handleNewDrawnLine={addNewDrawnLine}
			handleNewDrawnShape={addNewShape}
			handleNewText={addNewText}
			selected={selectedObjectName}
			activeShape={activeShape}
			disabled={disabled}
		/>
	));

	const renderTypingHandler = renderWhenTrue(() => (
		<TypingHandler
			mode={mode}
			stage={stageRef.current}
			layer={layerRef.current}
			color={color}
			fontSize={fontSize}
			onRefreshDrawingLayer={handleRefreshDrawingLayer}
			onAddNewText={addNewText}
			selected={selectedObjectName}
		/>
	));

	return (
		<StageContainer height={sizes.height} width={sizes.width}>
			<WindowEventListener event='resize' onEventTriggered={handleResize} />
			{renderIndicator(!disabled && isDrawingMode && !selectedObjectName)}
			<Stage
				id="stage"
				ref={stageRef}
				height={sizes.height}
				width={sizes.width}
				onMouseDown={handleStageMouseDown}
				onTouchStart={handleStageMouseDown}
			>
				<Layer ref={imageLayerRef} />
				<Layer ref={layerRef}>
					{canvasObjects}
					{renderErasing(isErasing)}
				</Layer>
				<Layer ref={drawingLayerRef} />
			</Stage>
			{renderDrawingHandler(stageRef.current)}
			{renderTypingHandler(stageRef.current)}
		</StageContainer>
	);
};

export const MarkupStage = withViewer(memo(BaseMarkupStage)) as (props: MarkupStageProps) => any;
