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

import { VIEWER_EVENTS } from '../../constants/viewer';
import { Container } from './viewerCanvas.styles';

interface IProps {
	className?: string;
	viewer: any;
	match: {
		params: {
			model: string;
			teamspace: string;
			revision?: string;
		}
	};
	changePinColor: (params) => void;
	setCamera: (params) => void;
	removeUnsavedPin: () => void;
}

export class ViewerCanvas extends React.PureComponent<IProps, any> {
	private containerRef = React.createRef<HTMLElement>();

	public componentDidMount() {
		const { viewer, changePinColor, setCamera, removeUnsavedPin } = this.props;
		viewer.init(this.containerRef.current);

		viewer.on(VIEWER_EVENTS.CHANGE_PIN_COLOUR, changePinColor);
		viewer.on(VIEWER_EVENTS.SET_CAMERA, setCamera);
		viewer.on(VIEWER_EVENTS.BACKGROUND_SELECTED_PIN_MODE, removeUnsavedPin);
	}

	public componentWillUnmount() {
		const { viewer } = this.props;
		viewer.off(VIEWER_EVENTS.CHANGE_PIN_COLOUR);
		viewer.off(VIEWER_EVENTS.SET_CAMERA);
		viewer.off(VIEWER_EVENTS.BACKGROUND_SELECTED_PIN_MODE);
		viewer.destroy();
	}

	public render() {
		return (
			<Container
				id="viewer"
				innerRef={this.containerRef}
				className={this.props.className}
			/>
		);
	}
}
