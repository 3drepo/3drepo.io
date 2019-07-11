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
}

export class ViewerCanvas extends React.PureComponent<IProps, any> {
	private containerRef = React.createRef<HTMLElement>();

	public componentDidMount() {
		const { viewer } = this.props;
		viewer.setupInstance(this.containerRef.current);
	}

	public render() {
		return (
			<Container
				id="viewer"
				ref={this.containerRef}
				className={this.props.className}
			/>
		);
	}
}
