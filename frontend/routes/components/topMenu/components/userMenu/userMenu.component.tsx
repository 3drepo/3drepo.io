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
		<MenuItem button aria-label={props.label} onClick={props.onButtonClick}>
			<MenuIcon>
				<Icon>{props.icon}</Icon>
			</MenuIcon>
			<MenuText primary={props.label} />
		</MenuItem>
	);
};

const UserMenuContent = (props) => {
	const hasMemorySettings = Boolean(localStorage.getItem('deviceMemory'));

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
			<UserMenuButton
				icon="view_list"
				label="Teamspaces"
				onButtonClick={props.onTeamspacesClick}
			/>
			<UserMenuButton
				icon="description"
				label="User manual"
				onButtonClick={props.openUserManual}
			/>
			<MenuItem>
				<MenuSwitch
					checked={props.isLiteMode}
					onChange={props.onLiteModeChange}
					color="secondary"
					inputProps={{
						'aria-label': 'Lite mode'
					}}
				/>
				<MenuText primary="Lite mode" />
			</MenuItem>
			{hasMemorySettings && <UserMenuButton
				icon="restore"
				label="Reset Settings"
				onButtonClick={props.resetMemorySettings}
			/>}
			<UserMenuButton
				icon="exit_to_app"
				label="Logout"
				onButtonClick={props.onLogout}
			/>
		</MenuContent>
	);
};

interface IProps {
	currentUser: any;
	isLiteMode?: boolean;
	onLiteModeChange?: () => void;
	onLogout?: () => void;
	onTeamspacesClick?: () => void;
}

export class UserMenu extends React.PureComponent<IProps, any> {
	public resetMemorySettings() {
		localStorage.removeItem('deviceMemory');
	}

	public openUserManual() {
		window.open('http://3drepo.org/models/3drepo-io-user-manual/', '_blank');
	}

	public render() {
		const menuContentProps = {
			...this.props,
			openUserManual: this.openUserManual,
			resetMemorySettings: this.resetMemorySettings
		};

		return (
			<ButtonMenu
				renderButton={UserButton}
				renderContent={() => <UserMenuContent {...menuContentProps} />}
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
