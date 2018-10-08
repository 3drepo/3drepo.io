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

import { Container } from './treeList.styles';

interface IProps {
	items: any[];
	render: (props) => Element;
	renderRoot: (props) => Element;
}

export class TreeList extends React.PureComponent<IProps, any> {
	public static defaultProps = {
		items: [],
		renderRoot: () => null
	};

	public renderItems = () => {
		return this.props.items.map((itemProps, index) => {
			return this.props.render({
				key: index,
				...itemProps
			});
		});
	}

	public render() {
		const { items } = this.props;

		return (
			<Container>
				{ this.props.renderRoot() }
				{ items.length ? this.renderItems() : null }
			</Container>
		);
	}
}
