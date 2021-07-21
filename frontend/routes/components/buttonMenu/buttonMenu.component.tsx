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

import { IconProps as IIconProps } from '@material-ui/core/Icon';
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import React from 'react';

import { StyledPopover } from './buttonMenu.styles';

interface IProps {
	Icon?: React.ComponentType;
	open?: boolean;
	ripple?: boolean;
	ButtonProps?: IconButtonProps;
	IconProps?: IIconProps;
	PopoverProps?: any;
	PaperProps?: any;
	container?: any;
	renderButton?: (props?) => React.ReactNode;
	renderContent?: (props?) => React.ReactNode;
	onClose?: () => void;
	onOpen?: () => void;
}

interface IState {
	activeMenu: boolean;
}

const DefaultButton = ({IconProps, Icon, ...props}) => (
	<IconButton
		{...props}
		aria-label="Toggle menu"
		aria-haspopup="true"
	>
		<Icon {...IconProps} />
	</IconButton>
);

export class ButtonMenu extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		renderButton: DefaultButton,
		renderContent: () => null
	};

	public state = {
		activeMenu: false
	};

	public buttonRef = React.createRef<HTMLElement>();

	public toggleMenu = (forceHide) => (event) => {
		event.stopPropagation();

		if (this.props.onClose) {
			this.props.onClose();
		}

		this.setState({
			activeMenu: forceHide ? false : !this.state.activeMenu
		});
	}

	public handleOnOpen = () => {
		if (this.props.onOpen) {
			this.props.onOpen();
		}
	}

	public componentDidMount() {
		this.setState({
			activeMenu: !!this.props.open
		});
	}

	public componentDidUpdate(prevProps) {
		if (this.props.open !== prevProps.open) {
			this.setState({
				activeMenu: this.props.open
			});
		}
	}

	public render() {
		const { Icon, renderButton, renderContent, ButtonProps, PopoverProps, PaperProps, IconProps, ripple } = this.props;
		const { activeMenu } = this.state;

		const buttonProps = {
			...ButtonProps,
			IconProps,
			Icon,
			onClick: this.toggleMenu(null),
			buttonRef: this.buttonRef,
		};

		const additionalButtonProps = ripple ? { isMenuOpen: activeMenu } : {};

		const popoverProps = { ...PopoverProps };

		return (
			<>
				{renderButton({...buttonProps, ...additionalButtonProps})}
				<StyledPopover
					{...popoverProps}
					PaperProps={...PaperProps}
					open={activeMenu}
					anchorEl={this.buttonRef.current}
					onClose={this.toggleMenu(false)}
					onEntering={this.handleOnOpen}
					disableRestoreFocus
				>
					{renderContent({ close: this.toggleMenu(false) })}
				</StyledPopover>
			</>
		);
	}
}
