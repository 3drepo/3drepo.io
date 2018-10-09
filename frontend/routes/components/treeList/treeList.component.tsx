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

import { Container, Headline, Details } from './treeList.styles';

interface IProps {
	items: any[];
	renderItem: (props) => Element;
	renderRoot: (props) => Element;
	itemHeight: number;
}

interface IState {
	active: boolean;
}

export class TreeList extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		items: [],
		renderRoot: () => null,
		itemHeight: 50
	};

	public state = {
		active: false
	};

	public renderItems = () => {
		return this.props.items.map((itemProps, index) => {
			return this.props.renderItem({
				key: index,
				...itemProps
			});
		});
	}

	public toggleActive = () => {
		this.setState({ active: !this.state.active });
	}

	public render() {
		const { items, itemHeight } = this.props;

		const containerProps = {
			active: items.length && this.state.active,
			disabled: items.length
		};

		const detailsProps = {
			active: items.length && this.state.active,
			maxHeight: `${items.length * itemHeight}px`
		};

		return (
			<Container {...containerProps}>
				<Headline onClick={this.toggleActive}>
					{ this.props.renderRoot() }
				</Headline>
				<Details {...detailsProps}>
					{ items.length ? this.renderItems() : null }
				</Details>
			</Container>
		);
	}
}
