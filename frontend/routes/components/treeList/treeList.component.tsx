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
import { isEmpty } from 'lodash';
import Grid from '@material-ui/core/Grid';

import { Container, Headline, Details, Title, StyledIcon } from './treeList.styles';

export const DefaultHeadline = (props) => (
	<Grid
		container
		direction="row"
		alignItems="center"
		justify="flex-start"
		wrap="nowrap">
		<StyledIcon fontSize="small">{props.active ? 'folder_open' : 'folder'}</StyledIcon>
		<Title>{props.name}</Title>
		{props.renderActions && props.renderActions(props)}
	</Grid>
);

interface IProps {
	name: string;
	items: any[];
	level?: number;
	active?: boolean;
	disableShadow?: boolean;
	renderItem?: (props) => JSX.Element;
	renderRoot?: (props) => JSX.Element;
	renderActions?: (props) => JSX.Element;
	onRootClick?: (state) => void;
}

interface IState {
	active: boolean;
}

export class TreeList extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		items: [],
		level: 1,
		active: false
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

	public handleRootClick = () => {
		this.setState({ active: !this.state.active }, () => {
			if (this.props.onRootClick) {
				this.props.onRootClick(this.state);
			}
		});
	}

	public componentDidMount() {
		if (this.props.active) {
			this.setState({active: true});
		}
	}

	public componentDidUpdate = (prevProps) => {
		const changes = {} as IState;

		const activeChanged = this.props.active !== prevProps.active;
		if (activeChanged) {
			changes.active = this.props.active;
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public render() {
		const { items, level, active: forceActive, ...props } = this.props;

		const active = items.length && this.state.active;

		const containerProps = {
			active,
			level,
			disabled: !items.length
		};

		const headlineProps = {
			...props,
			active,
			onClick: this.handleRootClick
		};

		return (
			<Container {...containerProps}>
				<Headline onClick={this.handleRootClick}>
					{
						this.props.renderRoot ?
							this.props.renderRoot(headlineProps) :
							<DefaultHeadline
								{...headlineProps}
								renderActions={this.props.renderActions}
							/>
					}
				</Headline>
				{ active ? <Details {...props}>{this.renderItems()}</Details> : null }
			</Container>
		);
	}
}
