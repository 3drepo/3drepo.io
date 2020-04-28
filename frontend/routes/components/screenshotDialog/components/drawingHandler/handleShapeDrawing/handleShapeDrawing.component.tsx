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

import React from 'react';

import { createShape } from '../drawingHandler.helpers';
import {
	HandleBaseDrawing, IHandleBaseDrawingProps, IHandleBaseDrawingStates,
} from '../handleBaseDrawing/handleBaseDrawing.component';

interface IHandleShapeDrawingProps extends IHandleBaseDrawingProps {
	activeShape: number;
	handleNewDrawnShape: (shape: number, attrs, updateState?: boolean) => void;
}

export class HandleShapeDrawing
		extends HandleBaseDrawing<IHandleShapeDrawingProps, IHandleBaseDrawingStates> {

	public componentDidUpdate(prevProps, prevState) {
		if (prevProps.activeShape !== this.props.activeShape) {
			this.activeShape = this.props.activeShape;
			this.unsubscribeDrawingEvents();
			this.subscribeDrawingEvents();
		}
	}

	public subscribeDrawingEvents = () => {
		if (!this.activeShape) {
			this.activeShape = this.props.activeShape;
		}

		this.props.stage.on('mousemove touchmove', this.handleMouseMoveShape);
		this.props.stage.on('mouseup touchend', this.handleMouseUpShape);
		this.props.stage.on('mousedown touchstart', this.handleMouseDownShape);
	}

	public unsubscribeDrawingEvents = () => {
		this.props.stage.off('mousemove touchmove', this.handleMouseMoveShape);
		this.props.stage.off('mouseup touchend', this.handleMouseUpShape);
		this.props.stage.off('mousedown touchstart', this.handleMouseDownShape);
	}

	public handleMouseMoveShape = () => {
		if (this.state.isCurrentlyDrawn && !this.props.selected) {
			this.drawShape();
		}
	}

	public handleMouseUpShape = () => {
		this.layer.clear();
		this.layer.clearCache();
		this.layer.destroyChildren();
		this.layer.batchDraw();

		this.props.handleNewDrawnShape(this.activeShape, this.lastShape);
		this.setState({ isCurrentlyDrawn: false });
	}

	public handleMouseDownShape = () => {
		if (this.props.selected) {
			return;
		}

		this.setState({ isCurrentlyDrawn: true });
		this.layer.clearBeforeDraw();
		const { x, y } = this.props.stage.getPointerPosition();

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
}
