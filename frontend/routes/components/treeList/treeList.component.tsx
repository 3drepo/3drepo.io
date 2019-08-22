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

import Grid from '@material-ui/core/Grid';
import React from 'react';

import Folder from '@material-ui/icons/Folder';
import FolderOpen from '@material-ui/icons/FolderOpen';
import { Highlight } from '../highlight/highlight.component';
import { Container, Headline, IconContainer, Title } from './treeList.styles';

export const TREE_LEVELS = {
	TEAMSPACE: 1,
	PROJECT: 2,
	MODEL: 3
};

const HeadlineIcon = ({IconOpened, IconClosed, active, ...iconProps}) => {
	let Icon = IconClosed || Folder;

	if (active) {
		Icon = IconOpened || FolderOpen;
	}
	return (
		<IconContainer>
			<Icon {...iconProps} />
		</IconContainer>
	);
};

export const DefaultHeadline = ({renderActions, ...props}) => {
	return (
		<Grid
			container
			direction="row"
			alignItems="center"
			justify="flex-start"
			wrap="nowrap">
			<HeadlineIcon fontSize="small" active={props.active && !props.disabled} {...props.IconProps} />
			<Title>
			<Highlight
				text={props.name}
				search={props.query}
				splitQueryToWords
			/>
			{props.disabled || props.isEmpty ? ' (empty)' : ''}
		</Title>
			{renderActions && renderActions(props)}
		</Grid>
	);
};

interface IProps {
	name: string;
	query?: string;
	level?: number;
	active?: boolean;
	disableShadow?: boolean;
	disabled?: boolean;
	isEmpty?: boolean;
	IconProps?: any;
	renderRoot?: (props) => JSX.Element;
	renderActions?: (props) => (JSX.Element | Element);
	onClick?: () => void;
}

interface IState {
	active: boolean;
	hovered: boolean;
}

export class TreeList extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		level: TREE_LEVELS.TEAMSPACE,
		active: false,
		disabled: false,
		query: ''
	};

	public state = {
		active: false,
		hovered: false
	};

	public componentDidMount() {
		this.setState({ active: this.props.active });
	}

	public componentDidUpdate(prevProps) {
		if (prevProps.active !== this.props.active) {
			this.setState({ active: this.props.active });
		}
	}

	private get isActive() {
		return this.state.active;
	}

	private handleRootClick = () => {
		const { disabled, onClick } = this.props;

		if (!disabled && onClick) {
			this.setState(({active}) => ({ active: !active }));
			this.props.onClick();
		}
	}

	private createHoverHandler = (hovered) => () => {
		this.setState({ hovered });
	}

	public render() {
		const { level, renderRoot, onClick, disabled, ...props } = this.props;
		const { hovered } = this.state;
		const active = this.isActive;
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
							: <DefaultHeadline {...headlineProps} />
					}
				</Headline>
			</Container>
		);
	}
}
