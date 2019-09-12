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
import ReactDOM from 'react-dom';

interface IProps {
	node: any;
	children: any;
}

export class Portal extends React.PureComponent <IProps, any> {
	public defaultNode = null;

	public componentDidMount() {
		this.renderPortal();
	}

	public componentDidUpdate() {
		this.renderPortal();
	}

	public componentWillUnmount() {
		ReactDOM.unmountComponentAtNode(this.defaultNode || this.props.node);
		if (this.defaultNode) {
			document.body.removeChild(this.defaultNode);
		}
		this.defaultNode = null;
	}

	public renderPortal() {
		if (!this.props.node && !this.defaultNode) {
			this.defaultNode = document.createElement('div');
			document.body.appendChild(this.defaultNode);
		}

		let children = this.props.children;

		if (typeof children.type === 'function') {
			children = React.cloneElement(children);
		}

		ReactDOM.render(children, this.props.node || this.defaultNode);
	}

	public render() {
		return null;
	}
}
