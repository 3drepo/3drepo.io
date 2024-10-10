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

import { ComponentType, createRef, PureComponent, ReactNode } from 'react';
import { IconProps as IIconProps } from '@mui/material/Icon';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { StyledPopover, Container } from './buttonMenu.styles';

interface IProps {
	Icon?: ComponentType;
	open?: boolean;
	ripple?: boolean;
	ButtonProps?: IconButtonProps;
	IconProps?: IIconProps;
	PopoverProps?: any;
	PaperProps?: any;
	container?: any;
	className?: string;
	renderButton?: (props?) => ReactNode;
	renderContent?: (props?) => ReactNode;
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
		size="large"
	>
		<Icon {...IconProps} />
	</IconButton>
);

export class ButtonMenu extends PureComponent<IProps, IState> {
	public static defaultProps = {
		renderButton: DefaultButton,
		renderContent: () => null
	};

	public state = {
		activeMenu: false
	};

	public ref = createRef<HTMLDivElement>();

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
		const {
			Icon,
			renderButton,
			renderContent,
			ButtonProps,
			PopoverProps,
			IconProps,
			ripple,
			className,
			onOpen,
			...props
		} = this.props;
		const { activeMenu } = this.state;

		const buttonProps = {
			...ButtonProps,
			IconProps,
			Icon,
			onClick: this.toggleMenu(null),
			...(ripple ? { isMenuOpen: activeMenu } : {}),
		};

		const popoverProps = { ...PopoverProps };

		return (
			<>
				<Container ref={this.ref} className={className}>
					{renderButton(buttonProps)}
				</Container>
				<StyledPopover
					{...popoverProps}
					{...props}
					open={activeMenu}
					anchorEl={this.ref.current}
					onClose={this.toggleMenu(false)}
					TransitionProps={{onEntering: this.handleOnOpen}}
					disableRestoreFocus
				>
					{renderContent({ close: this.toggleMenu(false) })}
				</StyledPopover>
			</>
		);
	}
}
