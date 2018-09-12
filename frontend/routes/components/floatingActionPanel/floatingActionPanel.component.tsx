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
import Icon from '@material-ui/core/Icon';
import Popover from '@material-ui/core/Popover';

import { Container, FloatingButton } from './floatingActionPanel.styles';

interface IProps {
	render: (closePanel: any) => void;
	children?: any;
	icon?: string;
	open?: boolean;
}

interface IState {
	anchorEl: HTMLElement;
	open: boolean;
}

export class FloatingActionPanel extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps: IProps) {
		return {
			open: nextProps.open
		};
	}

	public state = {
		anchorEl: null,
		open: false
	};

	public handleClick = (event) => {
		const { currentTarget } = event;
		this.setState((state) => ({
			anchorEl: currentTarget,
			open: !state.open
		}));
	}

	public handleClose = () => {
		this.setState({
			anchorEl: null
		});
	}

	public render() {
		const { icon } = this.props;
		const { anchorEl } = this.state;
		const open = Boolean(anchorEl);
		return (
			<Container>
				<FloatingButton
					variant="fab"
					color="secondary"
					aria-label="Toggle panel"
					mini={true}
					onClick={this.handleClick}
				>
					<Icon>{icon || 'add'}</Icon>
				</FloatingButton>
				<Popover
					open={open}
					anchorEl={anchorEl}
					onClose={this.handleClose}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'left'
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right'
					}}
				>
					{
						this.props.children || this.props.render({
							closePanel: this.handleClose
						})
					}
				</Popover>
			</Container>
		);
	}
}
