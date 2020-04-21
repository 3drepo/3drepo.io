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
import { between } from '../../../../../../helpers/between';
import { ELEMENT_TYPES } from '../../../screenshotDialog.helpers';
import { createDrawnLine } from '../handleBaseDrawing/handleBaseDrawing.helpers';

import {
	HandleBaseDrawing, IHandleBaseDrawingProps, IHandleBaseDrawingStates,
} from '../handleBaseDrawing/handleBaseDrawing.component';

interface IHandlePolygonDrawingProps extends IHandleBaseDrawingProps {
	handleNewDrawnLine: (line, type?, updateState?: boolean) => void;
}

export class HandlePolygonDrawing
		extends HandleBaseDrawing<IHandlePolygonDrawingProps, IHandleBaseDrawingStates> {

	public isAfterPolygonCreated: boolean = false;

	public subscribeDrawingEvents = () => {
		this.props.stage.on('mousemove touchmove', this.handleMouseMovePolygon);
		this.props.stage.on('mousedown touchstart', this.handleMouseDownPolygon);
		document.addEventListener('touchend', this.handleClickCheck);
		document.addEventListener('mouseup', this.handleClickCheck);
	}

	public unsubscribeDrawingEvents = () => {
		this.props.stage.off('mousemove touchmove', this.handleMouseMovePolygon);
		this.props.stage.off('mousedown touchstart', this.handleMouseDownPolygon);
		document.removeEventListener('touchend', this.handleClickCheck);
		document.removeEventListener('mouseup', this.handleClickCheck);
		this.isAfterPolygonCreated = false;
	}

	public handleClickCheck = (e) => {
		if (e.target.nodeName !== 'CANVAS') {
			this.drawLineToFirstPoint();
		}
	}

	public handleMouseMovePolygon = () => {
		if (this.state.isCurrentlyDrawn && this.lastLine.attrs) {
			const position = this.props.stage.getPointerPosition();
			const pointsCopy = this.lastLine.points().slice(0, -2);

			this.lastLine.points(pointsCopy.concat([position.x, position.y]));
			this.layer.batchDraw();
		}
	}

	public handleMouseDownPolygon = () => {
		if (this.props.selected) {
			return;
		}

		if (this.isAfterPolygonCreated) {
			this.isAfterPolygonCreated = false;
			return;
		}

		if (this.state.isCurrentlyDrawn) {
			this.drawLine();
			return;
		}

		this.setState({ isCurrentlyDrawn: true });
		this.layer.clearBeforeDraw();
		const { x, y } = this.props.stage.getPointerPosition();

		this.lastPointerPosition = {
			x: this.layer.attrs.x ? x - this.layer.attrs.x : x,
			y
		};

		this.lastLine = createDrawnLine(this.props.color, this.props.size, this.lastPointerPosition, this.props.mode, false);
		const newPoints = this.lastLine.points().concat([this.lastPointerPosition.x, this.lastPointerPosition.y]);

		this.lastLine.points(newPoints);
		this.layer.add(this.lastLine);
	}

	public drawLine = () => {
		if (this.isNearbyFirstPoint()) {
			this.drawLineToFirstPoint();
		} else {
			this.updateLastLinePoint();
		}

		this.lastPointerPosition = this.props.stage.getPointerPosition();
		this.layer.batchDraw();
	}

	public isNearbyFirstPoint = () => {
		const pullAreaRadius = this.props.size ? 5 + this.props.size : 10;
		const [firstX, firstY] = this.lastLine.points();

		return between(this.localPosition.x, firstX - pullAreaRadius, firstX + pullAreaRadius) &&
				between(this.localPosition.y, firstY - pullAreaRadius, firstY + pullAreaRadius);
	}

	public drawLineToFirstPoint = () => {
		if (Object.keys(this.lastLine).length) {
			const [firstX, firstY] = this.lastLine.points();
			const newPoints = this.lastLine.points().slice(0, -2);

			this.lastLine.points(newPoints.concat([firstX, firstY]));
			this.handlePolygonCreationEnd();
		}
	}

	public handlePolygonCreationEnd = () => {
		this.layer.clear();
		this.layer.clearCache();
		this.layer.destroyChildren();
		this.layer.batchDraw();

		if (this.lastLine.attrs.points.length > 6) {
			this.props.handleNewDrawnLine(this.lastLine, ELEMENT_TYPES.POLYGON);
		}
		this.lastLine = {};

		this.isAfterPolygonCreated = true;
		this.setState({ isCurrentlyDrawn: false });
	}
}
