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
import * as ReactDOM from 'react-dom';

import Icon from '@material-ui/core/Icon';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';

import { Container, Panel, FloatingButtonContainer, FloatingButton } from './floatingActionPanel.styles';

interface IProps {
	render: (closePanel: any) => void;
	container?: HTMLElement;
	children?: any;
	icon?: string;
	buttonProps?: any;
}

interface IState {
	anchorEl: HTMLElement;
	open: boolean;
}

export class FloatingActionPanel extends React.PureComponent<IProps, IState> {
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
			anchorEl: null,
			open: false
		});
	}

	public componentDidUpdate(prevProps, prevState) {
		if (prevState.open !== this.state.open && !this.state.open) {
			this.handleClose();
		}
	}

	public renderPanel() {
		const { icon, buttonProps = {} } = this.props;
		const { anchorEl, open } = this.state;

		const shouldOpen = open && Boolean(anchorEl);
		const disabledTooltip = !buttonProps.label || !buttonProps.disabled;

		return (
			<Container>
				<Tooltip
					title={buttonProps.label || ''}
					disableFocusListener={disabledTooltip}
					disableTouchListener={disabledTooltip}
					disableHoverListener={disabledTooltip}
				>
					<FloatingButtonContainer>
						<FloatingButton
							variant="fab"
							color="secondary"
							aria-label="Toggle panel"
							mini={true}
							onClick={this.handleClick}
							disabled={buttonProps.disabled}
						>
							<Icon>{icon || 'add'}</Icon>
						</FloatingButton>
					</FloatingButtonContainer>
				</Tooltip>
				<Panel
					open={shouldOpen}
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
				</Panel>
			</Container>
		);
	}

	public renderInContainer(container) {
		return ReactDOM.createPortal(
			this.renderPanel(),
			container
		);
	}

	public render() {
		const shouldUsePortal = Boolean(this.props.container);
		return (
			<>
				{ shouldUsePortal ? this.renderInContainer(this.props.container) : this.renderPanel() }
			</>
		);
	}
}
