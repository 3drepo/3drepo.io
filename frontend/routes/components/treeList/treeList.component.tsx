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

export const DefaultHeadline = ({renderActions, ...props}) => (
	<Grid
		container
		direction="row"
		alignItems="center"
		justify="flex-start"
		wrap="nowrap">
		<StyledIcon fontSize="small">{props.active ? 'folder_open' : 'folder'}</StyledIcon>
		<Title>{props.name} {props.disabled ? '(empty)' : ''}</Title>
		{renderActions && renderActions(props)}
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
	hovered: boolean;
}

export class TreeList extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		items: [],
		level: 1,
		active: false
	};

	public state = {
		active: false,
		hovered: false
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
		const { active } = this.state;
		const { items } = this.props;

		if (items.length) {
			this.setState({ active: !active }, () => {
				if (this.props.onRootClick) {
					this.props.onRootClick(this.state);
				}
			});
		}
	}

	public componentDidMount() {
		const changes = {} as IState;

		if (this.props.active) {
			changes.active = true;
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public componentDidUpdate = (prevProps) => {
		const changes = {} as IState;
		const { active, items } = this.props;

		const activeChanged = active !== prevProps.active;
		if (activeChanged) {
			changes.active = active && Boolean(items.length);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public createHoverHandler = (hovered) => () => {
		this.setState({ hovered });
	}

	public render() {
		const { items, level, renderRoot, ...props } = this.props;
		const { active, hovered } = this.state;
		const disabled = !items.length;

		const containerProps = { active, level, disabled, hovered };

		const headlineProps = {
			...props,
			active,
			disabled,
			hovered,
			renderActions: this.props.renderActions
		};

		return (
			<Container {...containerProps}>
				<Headline
					onClick={this.handleRootClick}
					onMouseEnter={this.createHoverHandler(true)}
					onMouseLeave={this.createHoverHandler(false)}
				>
					{
						renderRoot
							? renderRoot(headlineProps)
							: <DefaultHeadline {...headlineProps}/>
					}
				</Headline>
				{ active ? <Details {...props}>{this.renderItems()}</Details> : null }
			</Container>
		);
	}
}
