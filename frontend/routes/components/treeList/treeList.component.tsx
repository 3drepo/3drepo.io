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
import Grid from '@material-ui/core/Grid';

import { Container, Headline, Details, Title, StyledIcon } from './treeList.styles';

export const DefaultHeadline = (props) => (
	<Grid
		container
		direction="row"
		alignItems="center"
		justify="flex-start">
		<StyledIcon>{props.active ? 'folder_open' : 'folder'}</StyledIcon>
		<Title>{props.name}</Title>
	</Grid>
);

interface IProps {
	name: string;
	level?: number;
	items: any[];
	renderItem?: (props) => JSX.Element;
	renderRoot?: (props) => JSX.Element;
}

interface IState {
	active: boolean;
}

export class TreeList extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		items: []
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
		const { items, level, ...props } = this.props;

		const active = items.length && this.state.active;

		const containerProps = {
			active,
			level,
			disabled: !items.length
		};

		const detailsProps = { active };

		const headlineProps = {
			...props,
			active
		};

		return (
			<Container {...containerProps}>
				<Headline onClick={this.toggleActive}>
					{
						this.props.renderRoot ?
							this.props.renderRoot(headlineProps) :
							<DefaultHeadline {...headlineProps} />
					}
				</Headline>
				<Details {...detailsProps}>
					{ items.length ? this.renderItems() : null }
				</Details>
			</Container>
		);
	}
}
