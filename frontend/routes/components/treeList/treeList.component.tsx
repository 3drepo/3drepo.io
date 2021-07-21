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

import { Highlight } from '../highlight/highlight.component';
import { ChildrenContainer, Container, Headline, IconContainer, Title } from './treeList.styles';

export const TREE_LEVELS = {
	TEAMSPACE: 1,
	PROJECT: 2,
	MODEL: 3
};

const HeadlineIcon = ({IconOpened, IconClosed, active, ...iconProps}) => {
	let Icon = IconClosed;

	if (active) {
		Icon = IconOpened || IconClosed;
	}

	if (!Icon) {
		return null;
	}
	return (
		<IconContainer>
			<Icon {...iconProps} />
		</IconContainer>
	);
};

export const DefaultHeadline = ({children = Function.prototype, ...props}) => (
	<Grid
		container
		direction="row"
		alignItems="center"
		justify="flex-start"
		wrap="nowrap"
	>
		<HeadlineIcon fontSize="small" active={props.active && !props.disabled} {...props.IconProps} />
		<Title>
			<Highlight
				text={props.name}
				search={props.query}
				splitQueryToWords
			/>
			{props.disabled || props.isEmpty ? ' (empty)' : ''}
		</Title>
		<ChildrenContainer>{children(props)}</ChildrenContainer>
	</Grid>
);

interface IProps {
	className?: string;
	name: string;
	query?: string;
	level?: number;
	active?: boolean;
	disableShadow?: boolean;
	disabled?: boolean;
	isEmpty?: boolean;
	IconProps?: any;
	showStarredOnly?: boolean;
	id?: string;
	children?: (props) => JSX.Element;
	renderRoot?: (props) => JSX.Element;
	onClick?: () => void;
}

interface IState {
	active: boolean;
}

export class TreeList extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		level: TREE_LEVELS.TEAMSPACE,
		active: false,
		disabled: false,
		query: '',
		showStarredOnly: false
	};

	public state = {
		active: false,
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

	public render() {
		const { level, renderRoot, onClick, disabled, className, id, ...props } = this.props;
		const active = this.isActive;
		const containerProps = { active, level, disabled, className, id };

		const rootProps = {
			...props,
			active,
			disabled,
		};

		if (this.props.isEmpty && this.props.showStarredOnly) {
			return null;
		}

		return (
			<Container {...containerProps}>
				<Headline
					onClick={this.handleRootClick}
					active={active}
					level={level}
				>
					{
						renderRoot
							? renderRoot(rootProps)
							: <DefaultHeadline {...rootProps} />
					}
				</Headline>
			</Container>
		);
	}
}
