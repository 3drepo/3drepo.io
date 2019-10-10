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
import { MODES } from '../../screenshotDialog.helpers';
import { createShape, getDrawFunction, createDrawnLine } from './drawing.helpers';

interface IProps {
	color: string;
	size: number;
	mode: string;
	height: number;
	width: number;
	layer: any;
	stage: any;
	activeShape: number;
	selected: string;
	disabled: boolean;
	handleNewDrawnLine: (line) => void;
	handleNewDrawnShape: (shape, attrs) => void;
}

export class Drawing extends React.PureComponent <IProps, any> {
	public state = {
		isCurrentlyDrawn: false
	};

	public initialPointerPosition: any = { x: 0, y: 0 };
	public lastPointerPosition: any = { x: 0, y: 0 };
	public lastLine: any = {};
	public lastShape: any = {};

	get isDrawingMode() {
		return this.props.mode === MODES.BRUSH || this.props.mode === MODES.ERASER || this.props.mode === MODES.SHAPE;
	}

	get isDrawingLineMode() {
		return this.props.mode === MODES.BRUSH || this.props.mode === MODES.ERASER;
	}

	get layer() {
		return this.props.layer.current.getLayer();
	}

	public componentDidMount() {
		if (!this.props.disabled) {
			this.subscribeDrawingLineEvents();
		}
	}

	public componentWillMount() {
		this.unsubscribeDrawingLineEvents();
	}

	public componentDidUpdate(prevProps) {
		if (!this.props.disabled) {
			if (this.isDrawingLineMode && prevProps.mode !== MODES.BRUSH
				&& prevProps.mode !== MODES.ERASER && !this.props.selected) {
				this.subscribeDrawingLineEvents();
			}

			if (this.props.mode === MODES.SHAPE && prevProps.mode !== MODES.SHAPE) {
				this.subscribeDrawingShapeEvents();
			}

			if (!this.isDrawingLineMode && (prevProps.mode === MODES.BRUSH || prevProps.mode === MODES.ERASER)) {
				this.unsubscribeDrawingLineEvents();
			}

			if (this.props.mode !== MODES.SHAPE && prevProps.mode === MODES.SHAPE) {
				this.unsubscribeDrawingShapeEvents();
			}
		}
	}

	public subscribeDrawingLineEvents = () => {
		this.props.stage.on('mousemove', this.handleMouseMoveLine);
		this.props.stage.on('mouseup', this.handleMouseUpLine);
		this.props.stage.on('mousedown', this.handleMouseDownLine);
	}

	public unsubscribeDrawingLineEvents = () => {
		this.props.stage.off('mousemove', this.handleMouseMoveLine);
		this.props.stage.off('mouseup', this.handleMouseUpLine);
		this.props.stage.off('mousedown', this.handleMouseDownLine);
	}

	public subscribeDrawingShapeEvents = () => {
		this.props.stage.on('mousemove', this.handleMouseMoveShape);
		this.props.stage.on('mouseup', this.handleMouseUpShape);
		this.props.stage.on('mousedown', this.handleMouseDownShape);
	}

	public unsubscribeDrawingShapeEvents = () => {
		this.props.stage.off('mousemove', this.handleMouseMoveShape);
		this.props.stage.off('mouseup', this.handleMouseUpShape);
		this.props.stage.off('mousedown', this.handleMouseDownShape);
	}

	public handleMouseMoveShape = () => {
		const { isCurrentlyDrawn } = this.state;

		if (isCurrentlyDrawn && this.isDrawingMode && !this.props.selected) {
			this.drawShape();
		}
	}

	public handleMouseUpShape = () => {
		this.layer.clear();
		this.layer.clearCache();
		this.layer.destroyChildren();
		this.layer.batchDraw();

		this.props.handleNewDrawnShape(this.props.activeShape, this.lastShape);
		this.setState({ isCurrentlyDrawn: false });
	}

	public handleMouseDownShape = () => {
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

		this.lastShape = createShape(this.props.activeShape, commonProps, initialPositionProps);
		this.layer.add(this.lastShape);
	}

	public handleMouseDownLine = () => {
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
		const { isCurrentlyDrawn } = this.state;
		if (isCurrentlyDrawn && this.isDrawingMode) {
			this.drawLine();
		}
	}

	public drawLine = () => {
		const position = this.props.stage.getPointerPosition();
		const localPosition = {
			x: position.x - this.props.layer.current.x(),
			y: position.y - this.props.layer.current.y()
		};
		const newPoints = this.lastLine.points().concat([localPosition.x, localPosition.y]);

		this.lastLine.points(newPoints);
		this.lastPointerPosition = position;
		this.layer.batchDraw();
	}

	public drawShape = () => {
		const position = this.props.stage.getPointerPosition();
		const draw = getDrawFunction(this.props.activeShape, this.lastShape, this.initialPointerPosition, position);
		draw();
		this.layer.batchDraw();
	}

	public render() {
		return null;
	}
}
