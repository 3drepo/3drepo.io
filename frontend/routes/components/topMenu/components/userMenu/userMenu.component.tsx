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
import IconButton from '@material-ui/core/IconButton';
import ViewList from '@material-ui/icons/ViewList';
import ExitToApp from '@material-ui/icons/ExitToApp';
import Restore from '@material-ui/icons/Restore';
import Settings from '@material-ui/icons/Settings';
import ContactSupport from '@material-ui/icons/ContactSupport';

import { ButtonMenu } from '../../../buttonMenu/buttonMenu.component';
import {
	MenuContent,
	MenuIcon,
	MenuItem,
	MenuSwitch,
	MenuText,
	MenuUser,
	UserIcon
} from './userMenu.styles';
import { Avatar } from '../../../avatar/avatar.component';
import { VisualSettingsDialog } from '../visualSettingsDialog/visualSettingsDialog.component';

const UserButton = ({ IconProps, Icon, ...props }) => (
	<IconButton
		{...props}
		aria-label="Toggle user menu"
		aria-haspopup="true"
	>
		<UserIcon {...IconProps} />
	</IconButton>
);

const UserMenuButton = ({ Icon, ...props }) => {
	return (
		<MenuItem button={true} aria-label={props.label} onClick={props.onButtonClick}>
			<MenuIcon>
				<Icon />
			</MenuIcon>
			<MenuText primary={props.label} />
		</MenuItem>
	);
};

const UserMenuContent = (props) => {
	const hasMemorySettings = Boolean(localStorage.getItem('deviceMemory'));
	const { currentUser: { username, avatarUrl, firstName, lastName } } = props;
	const name = firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : username;

	const invokeAndClose = (callback) => (...args) => {
		callback(...args);
		props.close(...args);
	};

	return (
		<MenuContent component="nav">
			<MenuUser>
				<Avatar
					name={name}
					size={30}
					url={avatarUrl}
					fontSize={12}
				/>
				<MenuText primary={username} />
			</MenuUser>
			<Divider />
			<UserMenuButton
				Icon={ViewList}
				label="Teamspaces"
				onButtonClick={invokeAndClose(props.onTeamspacesClick)}
			/>
			<UserMenuButton
				Icon={ContactSupport}
				label="Support"
				onButtonClick={invokeAndClose(props.openUserManual)}
			/>
			<UserMenuButton
				Icon={Settings}
				label="Visual Settings"
				onButtonClick={invokeAndClose(props.openSettingsDialog)}
			/>
			<MenuItem>
				<MenuSwitch
					checked={props.isLiteMode}
					onChange={invokeAndClose(props.onLiteModeChange)}
					color="secondary"
					inputProps={{
						'aria-label': 'Lite mode'
					}}
				/>
				<MenuText primary="Lite mode" />
			</MenuItem>
			<UserMenuButton
				Icon={ExitToApp}
				label="Logout"
				onButtonClick={invokeAndClose(props.onLogout)}
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
	showDialog?: (config: any) => void;
	updateSettings?: (settings: any) => void;
	visualSettings?: any;
}

export class UserMenu extends React.PureComponent<IProps, any> {

	public openUserManual() {
		window.open('http://3drepo.org/support/', '_blank');
	}

	public openSettingsDialog = () => {
		const {visualSettings, updateSettings} = this.props;
		this.props.showDialog({
				title: 'Visual Settings',
				template: VisualSettingsDialog,
				data: {
					visualSettings,
					updateSettings
				}
		});
	}

	public renderMenuContent = (props) => {
		const menuContentProps = {
			...props,
			...this.props,
			openUserManual: this.openUserManual,
			openSettingsDialog: this.openSettingsDialog
		};

		return <UserMenuContent {...menuContentProps} />;
	}

	public render() {
		return (
			<ButtonMenu
				renderButton={UserButton}
				renderContent={this.renderMenuContent}
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
