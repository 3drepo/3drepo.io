/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { isEmpty } from 'lodash';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { batchGroupBy } from '../../../../../../modules/canvasHistory/canvasHistory.helpers';
import { COLOR } from '../../../../../../styles';
import { MODES } from '../../../markupStage/markupStage.helpers';

import { SHAPE_TYPES } from '../../shape/shape.constants';
import { TypingHandler } from '../../typingHandler/typingHandler.component';
import { createDrawnLine, createShape, getDrawFunction } from '../drawingHandler.helpers';
import {
	HandleBaseDrawing, IHandleBaseDrawingProps, IHandleBaseDrawingStates,
} from '../handleBaseDrawing/handleBaseDrawing.component';
import { getLinePoints } from './handleCalloutDrawing.helpers';

export interface IHandleCalloutDrawingProps extends IHandleBaseDrawingProps {
	textSize: number;
	activeShape: number;
	handleNewDrawnShape: (shape: number, attrs, updateState?: boolean) => void;
	handleNewDrawnLine: (line, type?, updateState?: boolean) => void;
	handleNewText: (position, text?: string, width?: number, updateState?: boolean) => void;
}

export interface IHandleCalloutDrawingStates extends IHandleBaseDrawingStates {
	calloutState: number;
	lastShape: any;
}

export class HandleCalloutDrawing
		extends HandleBaseDrawing<IHandleCalloutDrawingProps, IHandleCalloutDrawingStates> {

	public constructor(props) {
		super(props);
	}

	public state = {
		...super.state,
		calloutState: 1,
		lastShape: {},
	};

	public shape: any = {};

	private calloutShapeNormalizedMap = {
		[SHAPE_TYPES.CALLOUT_DOT]: SHAPE_TYPES.CIRCLE,
		[SHAPE_TYPES.CALLOUT_CIRCLE]: SHAPE_TYPES.CIRCLE,
		[SHAPE_TYPES.CALLOUT_RECTANGLE]: SHAPE_TYPES.RECTANGLE,
	};

	public componentDidUpdate(prevProps, prevState) {
		if (prevProps.activeShape !== this.props.activeShape) {
			this.activeShape = this.props.activeShape;
			this.unsubscribeDrawingEvents();
			this.subscribeDrawingEvents();
		}

		if (prevState.calloutState !== this.state.calloutState) {
			this.unsubscribeDrawingEvents();
			this.subscribeDrawingEvents();
		}
	}

	public subscribeDrawingEvents = () => {
		if (!this.activeShape) {
			this.activeShape = this.props.activeShape;
		}

		if (this.state.calloutState === 1) {
			if (this.activeShape === SHAPE_TYPES.CALLOUT_DOT) {
				this.subscribeDotDrawingEvents();
			} else {
				this.subscribeShapeDrawingEvents();
			}
		} else if (this.state.calloutState === 2) {
			this.subscribeLineDrawingEvents();
		}
	}

	public unsubscribeDrawingEvents = () => {
		this.unsubscribeShapeDrawingEvents();
		this.unsubscribeLineDrawingEvents();
		this.unsubscribeDotDrawingEvents();
	}

	public subscribeDotDrawingEvents = () => {
		this.props.stage.on('mouseup touchend', this.handleMouseUpDot);
	}

	public unsubscribeDotDrawingEvents = () => {
		this.props.stage.off('mouseup touchend', this.handleMouseUpDot);
	}

	public handleMouseUpDot = () => {
		this.setState({ isCurrentlyDrawn: true });
		this.layer.clearBeforeDraw();
		const { x, y } = this.pointerPosition;

		this.lastPointerPosition = this.initialPointerPosition = {
			x,
			y
		};

		const initialPositionProps = {
			x: this.lastPointerPosition.x,
			y: this.initialPointerPosition.y
		};

		const commonProps = {
			stroke: this.props.color,
			fill: this.props.color,
			strokeWidth: this.props.size,
			draggable: false,
			radius: this.props.size,
		};

		this.lastShape = createShape(SHAPE_TYPES.CIRCLE, commonProps, initialPositionProps);
		this.layer.add(this.lastShape);

		this.handleMouseUpShape();
	}

	public subscribeLineDrawingEvents = () => {
		this.props.stage.on('mousemove touchmove', this.handleMouseMoveLine);
	}

	public unsubscribeLineDrawingEvents = () => {
		this.props.stage.off('mousemove touchmove', this.handleMouseMoveLine);
	}

	public saveCallout = () => {
		this.layer.clear();
		this.layer.clearCache();
		this.layer.destroyChildren();
		this.layer.batchDraw();

		this.props.handleNewDrawnShape(this.calloutShapeNormalizedMap[this.activeShape], this.shape, false);
		this.props.handleNewDrawnLine(this.lastLine, '', false);
		this.props.handleNewDrawnShape(SHAPE_TYPES.RECTANGLE, this.lastShape, false);
		this.setState({ isCurrentlyDrawn: false });
	}

	public handleRefreshDrawingLayer = () => {
		if (!isEmpty(this.lastShape)) {
			const linePoints = getLinePoints(this.shape, this.lastShape);
			if (linePoints) {
				this.lastLine.points(getLinePoints(this.shape, this.lastShape));
				this.layer.batchDraw();
			}
		}
	}

	public handleMouseMoveLine = () => {
		if (this.state.isCurrentlyDrawn) {
			if (isEmpty(this.lastShape)) {
				this.layer.clearBeforeDraw();
				const { x, y } = this.pointerPosition;

				this.lastPointerPosition = this.initialPointerPosition = {
					x,
					y
				};

				const initialPositionProps = {
					x: this.lastPointerPosition.x,
					y: this.initialPointerPosition.y
				};

				const commonProps = {
					stroke: this.props.color,
					strokeWidth: this.props.size,
					draggable: false,
					fill: COLOR.WHITE,
				};

				this.lastShape = createShape(SHAPE_TYPES.RECTANGLE, commonProps, initialPositionProps);
				this.layer.add(this.lastShape);
				this.setState({
					lastShape : this.lastShape,
				});
			} else {
				this.lastLine.points(getLinePoints(this.shape, this.lastShape));
				this.layer.batchDraw();
			}
		}
	}

	public subscribeShapeDrawingEvents = () => {
		this.props.stage.on('mousemove touchmove', this.handleMouseMoveShape);
		this.props.stage.on('mouseup touchend', this.handleMouseUpShape);
		this.props.stage.on('mousedown touchstart', this.handleMouseDownShape);
	}

	public unsubscribeShapeDrawingEvents = () => {
		this.props.stage.off('mousemove touchmove', this.handleMouseMoveShape);
		this.props.stage.off('mouseup touchend', this.handleMouseUpShape);
		this.props.stage.off('mousedown touchstart', this.handleMouseDownShape);
	}

	public handleMouseMoveShape = () => {
		if (!this.props.selected && this.state.isCurrentlyDrawn) {
			this.drawShape();
		}
	}

	public handleMouseUpShape = () => {
		this.layer.batchDraw();
		this.lastPointerPosition = this.pointerPosition;

		this.setState({ calloutState: 2 });
		this.shape = this.lastShape;
		this.lastShape = {};

		this.layer.clearBeforeDraw();
		const { x, y } = this.pointerPosition;

		this.lastPointerPosition = {
			x: this.layer.attrs.x ? x - this.layer.attrs.x : x,
			y
		};

		this.lastLine = createDrawnLine(this.props.color, this.props.size, this.lastPointerPosition, this.props.mode, false);
		const newPoints = this.lastLine.points().concat([this.lastPointerPosition.x, this.lastPointerPosition.y]);

		this.lastLine.points(newPoints);
		this.layer.add(this.lastLine);
	}

	public handleMouseDownShape = () => {
		if (this.props.selected) {
			return;
		}

		this.setState({ isCurrentlyDrawn: true });
		this.layer.clearBeforeDraw();
		const { x, y } = this.pointerPosition;

		this.lastPointerPosition = this.initialPointerPosition = {
			x,
			y
		};

		const initialPositionProps = {
			x: this.lastPointerPosition.x,
			y: this.initialPointerPosition.y
		};

		const commonProps = {
			stroke: this.props.color,
			strokeWidth: this.props.size,
			draggable: false
		};

		this.lastShape = createShape(this.calloutShapeNormalizedMap[this.activeShape], commonProps, initialPositionProps);
		this.layer.add(this.lastShape);
	}

	public addText = (position, text, width) => {
		batchGroupBy.start();
		this.saveCallout();
		this.props.handleNewText(position, text, width, false);
		batchGroupBy.end();
		setTimeout(() => {
			this.setState({ calloutState: 1, isCurrentlyDrawn: false });
		});
	}

	public drawShape = () => {
		const draw = getDrawFunction(
			this.calloutShapeNormalizedMap[this.activeShape],
			this.lastShape,
			this.initialPointerPosition,
			this.pointerPosition,
		);
		draw();
		this.layer.batchDraw();
	}

	public renderEditableTextarea = renderWhenTrue(() => (
		<TypingHandler
			mode={MODES.TEXT}
			stage={this.props.stage}
			layer={this.layer}
			color={this.props.color}
			fontSize={this.props.textSize}
			size={this.props.size}
			onRefreshDrawingLayer={this.handleRefreshDrawingLayer}
			onAddNewText={this.addText}
			selected={this.props.selected}
			boxRef={this.state.lastShape}
		/>
	));

	public render() {
		return this.renderEditableTextarea(this.state.calloutState === 2);
	}
}
