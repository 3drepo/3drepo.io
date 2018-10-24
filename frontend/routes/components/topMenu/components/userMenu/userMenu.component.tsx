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
import Divider from '@material-ui/core/Divider';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';

import { ButtonMenu } from '../../../buttonMenu/buttonMenu.component';
import {
	MenuAvatar,
	MenuContent,
	MenuIcon,
	MenuItem,
	MenuSwitch,
	MenuText,
	MenuUser,
	UserIcon
} from './userMenu.styles';

const UserButton = ({ IconProps, icon, ...props }) => {
	return (
		<IconButton
			{...props}
			aria-label="Toggle user menu"
			aria-haspopup="true"
		>
			<UserIcon {...IconProps}>{icon}</UserIcon>
		</IconButton>
	);
};

const UserMenuButton = (props) => {
	return (
		<MenuItem button>
			<MenuIcon>
				<Icon>{props.icon}</Icon>
			</MenuIcon>
			<MenuText primary={props.label} />
		</MenuItem>
	);
};

const UserMenuContent = (props) => {
	return (
		<MenuContent component="nav">
			<MenuUser>
				<MenuAvatar
					alt={props.currentUser.username}
					src={props.currentUser.avatarUrl}
				/>
				<MenuText primary={props.currentUser.username} />
			</MenuUser>
			<Divider />
			<UserMenuButton icon="view_list" label="Teamspaces" />
			<UserMenuButton icon="description" label="User manual" />
			<MenuItem>
				<MenuSwitch
					checked={props.isLiteMode}
					onChange={props.onLiteModeChange}
					color="secondary"
				/>
				<MenuText primary="Lite mode" />
			</MenuItem>
			<UserMenuButton
				icon="exit_to_app"
				label="Logout"
				onClick={props.onLogout}
			/>
		</MenuContent>
	);
};

interface IProps {
	currentUser: any;
	isLiteMode?: boolean;
	onLiteModeChange?: () => void;
	onLogout?: () => void;
}

export class UserMenu extends React.PureComponent<IProps, any> {
	public render() {
		return (
			<ButtonMenu
				renderButton={UserButton}
				renderContent={() => <UserMenuContent {...this.props} />}
				icon="account_circle"
				PopoverProps={{
					anchorOrigin: {
						vertical: 'top',
						horizontal: 'right'
					}
				}}
			/>
		);
	}
}
