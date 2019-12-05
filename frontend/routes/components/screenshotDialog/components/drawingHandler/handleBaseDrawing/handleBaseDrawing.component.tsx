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

export interface IHandleBaseDrawing {
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

export class HandleBaseDrawing extends React.PureComponent <IHandleBaseDrawing, any> {
	public constructor(props) {
		super(props);
	}

	public initialPointerPosition: any = { x: 0, y: 0 };
	public lastPointerPosition: any = { x: 0, y: 0 };

	public state = {
		isCurrentlyDrawn: false,
	};

	public componentDidMount() {
		if (!this.props.disabled) {
			this.subscribeDrawingEvents();
		}
	}

	public componentWillMount() {
		this.unsubscribeDrawingEvents();
	}

	public subscribeDrawingEvents = () => {
	}

	public unsubscribeDrawingEvents = () => {
	}

	get layer() {
		return this.props.layer.current.getLayer();
	}

	public render() {
		return null;
	}
}
