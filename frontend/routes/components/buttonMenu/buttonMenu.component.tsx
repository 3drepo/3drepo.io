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
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import Icon, { IconProps as IIconProps } from '@material-ui/core/Icon';
import Popover, { PopoverProps as IPopoverProps } from '@material-ui/core/Popover';

import { Container } from './buttonMenu.styles';

interface IProps {
	icon: string;
	ButtonProps?: IconButtonProps;
	IconProps?: IIconProps;
	PopoverProps?: any;
	renderButton?: (props) => JSX.Element;
	renderContent?: () => JSX.Element;
}

interface IState {
	activeMenu: boolean;
}

const DefaultButton = ({IconProps, icon, ...props}) => (
	<IconButton
		{...props}
		aria-label="Toggle menu"
		aria-haspopup="true"
	>
		<Icon {...IconProps}>{icon}</Icon>
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

	public toggleMenu = (forceHide) => () => {
		this.setState({
			activeMenu: forceHide ? false : !this.state.activeMenu
		});
	}

	public render() {
		const { icon, renderButton, renderContent, ButtonProps, PopoverProps, IconProps } = this.props;
		const { activeMenu } = this.state;

		const buttonProps = {
			...ButtonProps,
			IconProps,
			icon,
			onClick: this.toggleMenu(null),
			buttonRef: this.buttonRef
		};
		const popoverProps = { ...PopoverProps };

		return (
			<>
				{renderButton(buttonProps)}
				<Popover
					{...popoverProps}
					open={activeMenu}
					anchorEl={this.buttonRef.current}
					onClose={this.toggleMenu(false)}
				>
					{renderContent()}
				</Popover>
			</>
		);
	}
}
