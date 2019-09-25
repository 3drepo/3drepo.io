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
import { MODE_OPERATION, MODES } from '../../screenshotDialog.helpers';

const Konva = window.Konva;
interface IProps {
	color: string;
	size: number;
	mode: string;
	height: number;
	width: number;
	layer: any;
	stage: any;
	handleNewDrawnLine: (line) => void;
}

export class Drawing extends React.PureComponent <IProps, any> {
	public state = {
		isCurrentlyDrawn: false
	};

	public lastPointerPosition: any = { x: 0, y: 0 };
	public lastLine: any = {};

	get isDrawingMode() {
		return this.props.mode === MODES.BRUSH || this.props.mode === MODES.ERASER;
	}

	get layer() {
		return this.props.layer.current.getLayer();
	}

	public componentDidMount() {
		this.props.stage.on('mousemove', this.handleMouseMove);
		this.props.stage.on('mouseup', this.handleMouseUp);
		this.props.stage.on('mousedown', this.handleMouseDown);
	}

	public componentWillMount() {
		this.props.stage.off('mousemove', this.handleMouseMove);
		this.props.stage.off('mouseup', this.handleMouseUp);
		this.props.stage.off('mousedown', this.handleMouseDown);
	}

	public componentDidUpdate() {
		if (this.props.mode === MODES.BRUSH) {
			this.props.stage.on('mousemove', this.handleMouseMove);
			this.props.stage.on('mouseup', this.handleMouseUp);
			this.props.stage.on('mousedown', this.handleMouseDown);
		} else {
			this.props.stage.off('mousemove', this.handleMouseMove);
			this.props.stage.off('mouseup', this.handleMouseUp);
			this.props.stage.off('mousedown', this.handleMouseDown);
		}
	}

	public handleMouseDown = () => {
		this.setState({ isCurrentlyDrawn: true });
		this.layer.clearBeforeDraw();

		this.lastPointerPosition = this.props.stage.getPointerPosition();
		this.lastLine = new Konva.Line({
			stroke: this.props.color,
			strokeWidth: this.props.size,
			globalCompositeOperation: MODE_OPERATION[this.props.mode],
			points: [this.lastPointerPosition.x, this.lastPointerPosition.y],
			lineCap: 'round',
			draggable: true
		});
		this.layer.add(this.lastLine);
	}

	public handleMouseUp = () => {
		this.layer.clear();
		this.layer.clearCache();
		this.layer.destroyChildren();
		this.layer.batchDraw();

		this.props.handleNewDrawnLine(this.lastLine);
		this.setState({ isCurrentlyDrawn: false });
	}

	public handleMouseMove = () => {
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

	public render() {
		return null;
	}
}
