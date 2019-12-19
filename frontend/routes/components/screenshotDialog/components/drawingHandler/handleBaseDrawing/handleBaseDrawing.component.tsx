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

import * as React from 'react';
import {getDrawFunction} from '../drawingHandler.helpers';

export interface IHandleBaseDrawingProps {
	color: string;
	size: number;
	mode: string;
	height: number;
	width: number;
	layer: any;
	stage: any;
	selected: string;
	disabled: boolean;
}

export interface IHandleBaseDrawingStates {
	isCurrentlyDrawn: boolean;
}

export class HandleBaseDrawing<P, S> extends React.PureComponent<IHandleBaseDrawingProps & P> {

	public state = {
		isCurrentlyDrawn: false,
	};

	public constructor(props) {
		super(props);
	}

	public activeDrawingShape: number = 0;
	public initialPointerPosition: any = { x: 0, y: 0 };
	public lastPointerPosition: any = { x: 0, y: 0 };
	public lastShape: any = {};
	public lastLine: any = {};

	public componentDidMount() {
		if (!this.props.disabled) {
			this.subscribeDrawingEvents();
		}
	}

	public componentWillUnmount() {
		this.unsubscribeDrawingEvents();
	}

	public subscribeDrawingEvents = () => {
	}

	public unsubscribeDrawingEvents = () => {
	}

	get activeShape() {
		return this.activeDrawingShape;
	}

	set activeShape(shape: number) {
		this.activeDrawingShape = shape;
	}

	get layer() {
		return this.props.layer.current.getLayer();
	}

	get pointerPosition() {
		return this.props.stage.getPointerPosition();
	}

	public get localPosition() {
		const position = this.props.stage.getPointerPosition();
		const currentLayer = this.props.layer.current;
		return {
			x: position.x - currentLayer.x(),
			y: position.y - currentLayer.y()
		};
	}

	public updateLastLinePoint = () => {
		const newPoints = this.lastLine.points().concat([this.localPosition.x, this.localPosition.y]);
		this.lastLine.points(newPoints);
	}

	public drawShape = () => {
		const draw = getDrawFunction(this.activeShape, this.lastShape, this.initialPointerPosition, this.pointerPosition);
		draw();
		this.layer.batchDraw();
	}

	public drawLine = () => {
		const position = this.props.stage.getPointerPosition();

		this.updateLastLinePoint();
		this.lastPointerPosition = position;
		this.layer.batchDraw();
	}

	public render() {
		return null;
	}
}
