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

import { createDrawnLine } from '../drawingHandler.helpers';
import {
	HandleBaseDrawing, IHandleBaseDrawingProps, IHandleBaseDrawingStates,
} from '../handleBaseDrawing/handleBaseDrawing.component';

interface IHandleLineDrawingProps extends IHandleBaseDrawingProps {
	handleNewDrawnLine: (line, type?, updateState?: boolean) => void;
}

export class HandleLineDrawing
		extends HandleBaseDrawing<IHandleLineDrawingProps, IHandleBaseDrawingStates> {

	public subscribeDrawingEvents = () => {
		this.props.stage.on('mousemove touchmove', this.handleMouseMoveLine);
		this.props.stage.on('mouseup touchend', this.handleMouseUpLine);
		this.props.stage.on('mousedown touchstart', this.handleMouseDownLine);
	}

	public unsubscribeDrawingEvents = () => {
		this.props.stage.off('mousemove touchmove', this.handleMouseMoveLine);
		this.props.stage.off('mouseup touchend', this.handleMouseUpLine);
		this.props.stage.off('mousedown touchstart', this.handleMouseDownLine);
	}

	public handleMouseDownLine = () => {
		if (this.props.selected) {
			return;
		}

		this.setState({ isCurrentlyDrawn: true });
		this.layer.clearBeforeDraw();
		const { x, y } = this.props.stage.getPointerPosition();

		this.lastPointerPosition = {
			x: this.layer.attrs.x ? x - this.layer.attrs.x : x,
			y
		};

		this.lastLine = createDrawnLine(this.props.color, this.props.size, this.lastPointerPosition, this.props.mode);
		this.layer.add(this.lastLine);
	}

	public handleMouseUpLine = () => {
		this.layer.clear();
		this.layer.clearCache();
		this.layer.destroyChildren();
		this.layer.batchDraw();

		if (this.lastLine.attrs.points.length > 6) {
			this.props.handleNewDrawnLine(this.lastLine);
		}

		this.setState({ isCurrentlyDrawn: false });
	}

	public handleMouseMoveLine = () => {
		if (this.state.isCurrentlyDrawn) {
			this.drawLine();
		}
	}
}
