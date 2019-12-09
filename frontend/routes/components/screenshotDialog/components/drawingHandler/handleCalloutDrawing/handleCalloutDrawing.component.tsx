/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import { clamp, isEmpty } from 'lodash';
import React from 'react';
import { WHITE } from '../../../../../../styles';
import { createDrawnLine, createShape } from '../../drawing/drawing.helpers';
import { SHAPE_TYPES } from '../../shape/shape.constants';
import {
	HandleBaseDrawing, IHandleBaseDrawingProps, IHandleBaseDrawingStates,
} from '../handleBaseDrawing/handleBaseDrawing.component';

export interface IHandleCalloutDrawingProps extends IHandleBaseDrawingProps {
	activeCalloutShape: number;
	handleNewDrawnShape: (shape: number, attrs, updateState?: boolean) => void;
	handleNewDrawnLine: (line, type?, updateState?: boolean) => void;
	handleNewText: (position, updateState?: boolean) => () => any;
}

export interface IHandleCalloutDrawingStates extends IHandleBaseDrawingStates {
	calloutState: number;
}

export class HandleCalloutDrawing
		extends HandleBaseDrawing<IHandleCalloutDrawingProps, IHandleCalloutDrawingStates> {

	public constructor(props) {
		super(props);
	}

	public state = {
		...super.state,
		calloutState: 1,
	};

	public shape: any = {};

	public componentDidUpdate(prevProps) {
		if (prevProps.activeCalloutShape !== this.props.activeCalloutShape) {
			this.activeShape = this.props.activeCalloutShape;
			this.unsubscribeDrawingEvents();
			this.subscribeDrawingEvents();
		}
	}

	public subscribeDrawingEvents = () => {
		if (!this.activeShape) {
			this.activeShape = this.props.activeCalloutShape;
		}

		if (this.state.calloutState === 1) {
			if (this.activeShape === SHAPE_TYPES.DOT) {
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

	// DOT
	public subscribeDotDrawingEvents = () => {
		this.props.stage.on('mouseup', this.handleMouseUpDot);
	}

	public unsubscribeDotDrawingEvents = () => {
		this.props.stage.off('mouseup', this.handleMouseUpDot);
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
			strokeWidth: clamp(this.props.size * 2, 1, 8),
			draggable: true,
			radius: 1.1,
		};

		this.lastShape = createShape(SHAPE_TYPES.CIRCLE, commonProps, initialPositionProps);
		this.layer.add(this.lastShape);

		this.handleMouseUpShape();
	}

	// LINE
	public subscribeLineDrawingEvents = () => {
		this.props.stage.on('mousemove', this.handleMouseMoveLine);
		this.props.stage.on('mousedown', this.handleMouseDownLine);
	}

	public unsubscribeLineDrawingEvents = () => {
		this.props.stage.off('mousemove', this.handleMouseMoveLine);
		this.props.stage.off('mousedown', this.handleMouseDownLine);
	}

	public handleMouseDownLine = () => {
		this.layer.clear();
		this.layer.clearCache();
		this.layer.destroyChildren();
		this.layer.batchDraw();

		(async () => {
			const normalizeShape = this.activeShape === SHAPE_TYPES.DOT ? SHAPE_TYPES.CIRCLE : this.activeShape;
			await this.props.handleNewDrawnShape(normalizeShape, this.shape, false);
			await this.props.handleNewDrawnLine(this.lastLine, '', false);
			await this.props.handleNewDrawnShape(SHAPE_TYPES.RECTANGLE, this.lastShape, false);
			const updatedState = await this.props.handleNewText(this.pointerPosition, false);
			// this.setState({ isCurrentlyDrawn: false });
			updatedState();
		})();
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
					strokeWidth: clamp(this.props.size / 2, 1, 4),
					draggable: true
				};

				this.lastShape = createShape(SHAPE_TYPES.RECTANGLE, commonProps, initialPositionProps);
				this.layer.add(this.lastShape);
			} else {
				this.lastLine.points(this.getShapePoints(this.shape, this.lastShape));
				this.lastShape.x(this.pointerPosition.x - 10);
				this.lastShape.y(this.pointerPosition.y - 10);
				this.lastShape.width(210);
				this.lastShape.height(60);
				this.lastShape.fill(WHITE);

				this.layer.batchDraw();
			}

		}
	}

	public getShapePoints = (shapeFrom, shapeTo) => {
		let dx;
		let dy;
		if (shapeFrom.getClassName() === 'Circle') {
			dx = (shapeTo.x() + shapeTo.width() / 2) - shapeFrom.x();
			dy = (shapeTo.y() + shapeTo.height() / 2) - shapeFrom.y();
		} else {
			dx = (shapeTo.x() + shapeTo.width() / 2) - (shapeFrom.x() + shapeFrom.width() / 2);
			dy = (shapeTo.y() + shapeTo.height() / 2) - (shapeFrom.y() + shapeFrom.height() / 2);
		}
		const angle = Math.atan2(-dy, dx);
		const radiusFrom = shapeFrom.attrs.radius;

		let pointsFrom = [];
		let pointsTo = [];

		if (shapeFrom.getClassName() === 'Circle') {
			pointsFrom = [
				shapeFrom.x() + -radiusFrom * Math.cos(angle + Math.PI),
				shapeFrom.y() + radiusFrom * Math.sin(angle + Math.PI),
			];
		} else {
			if (angle <= 0.75 && angle >= -0.75) {
				pointsFrom = [
					shapeFrom.x(),
					shapeFrom.y() + shapeFrom.height() / 2,
				];
			} else if (angle > 0.75 && angle <= 2.25) {
				pointsFrom = [
					shapeFrom.x() + shapeFrom.width() / 2,
					shapeFrom.y()
				];
			} else if (angle < -0.75 && angle >= -2.25) {
				pointsFrom = [
					shapeFrom.x() + shapeFrom.width() / 2,
					shapeFrom.y() + shapeFrom.height(),
				];
			} else {
				pointsFrom = [
					shapeFrom.x() + shapeFrom.width(),
					shapeFrom.y() + shapeFrom.height() / 2,
				];
			}
		}

		if (angle <= 0.75 && angle >= -0.75) {
			pointsTo = [
				shapeTo.x(),
				shapeTo.y() + shapeTo.height() / 2,
			];
		} else if (angle > 0.75 && angle <= 2.25) {
			pointsTo = [
				shapeTo.x() + shapeTo.width() / 2,
				shapeTo.y() + shapeTo.height(),
			];
		} else if (angle < -0.75 && angle >= -2.25) {
			pointsTo = [
				shapeTo.x() + shapeTo.width() / 2,
				shapeTo.y(),
			];
		} else {
			pointsTo = [
				shapeTo.x() + shapeTo.width(),
				shapeTo.y() + shapeTo.height() / 2,
			];
		}

		return [ ...pointsFrom, ...pointsTo];
	}

	// SHAPE
	public subscribeShapeDrawingEvents = () => {
		this.props.stage.on('mousemove', this.handleMouseMoveShape);
		this.props.stage.on('mouseup', this.handleMouseUpShape);
		this.props.stage.on('mousedown', this.handleMouseDownShape);
	}

	public unsubscribeShapeDrawingEvents = () => {
		this.props.stage.off('mousemove', this.handleMouseMoveShape);
		this.props.stage.off('mouseup', this.handleMouseUpShape);
		this.props.stage.off('mousedown', this.handleMouseDownShape);
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
		this.unsubscribeShapeDrawingEvents();
		this.subscribeLineDrawingEvents();

		this.layer.clearBeforeDraw();
		const { x, y } = this.pointerPosition;

		this.lastPointerPosition = {
			x: this.layer.attrs.x ? x - this.layer.attrs.x : x,
			y
		};

		const calloutLineSize = clamp(this.props.size / 2, 1, 4);

		this.lastLine = createDrawnLine(this.props.color, calloutLineSize, this.lastPointerPosition, this.props.mode, false);
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
			draggable: true
		};

		this.lastShape = createShape(this.activeShape, commonProps, initialPositionProps);
		this.layer.add(this.lastShape);
	}

	public render() {
		return null;
	}
}
