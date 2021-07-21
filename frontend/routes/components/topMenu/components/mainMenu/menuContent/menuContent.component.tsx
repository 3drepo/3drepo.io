/**
 *  Copyright (C) 2020 3D Repo Ltd
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
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import PATIcon from '@material-ui/icons/InsertDriveFileOutlined';
import SettingsIcon from '@material-ui/icons/Settings';
import TeamspacesIcon from '@material-ui/icons/ViewList';

import { LANDING_ROUTES, STATIC_ROUTES } from '../../../../../../services/staticPages';
import { COLOR } from '../../../../../../styles';
import { Avatar } from '../../../../avatar/avatar.component';
import { NestedMenuItem } from '../../nestedMenuItem/nestedMenuItem.component';
import { IUserData } from '../mainMenu.helpers';
import { MenuIcon, MenuItem, MenuText, MenuUser } from './menuContent.styles';

const ExternalLink = ({ ...props }) => {
	const Icon = props.icon || React.Fragment;
	const iconProps = props.icon ? { style: { color: COLOR.BLACK_54 } } : {};
	return (
		<MenuItem button aria-label={props.label} onClick={props.onButtonClick}>
			<MenuIcon>
				<Icon {...iconProps} />
			</MenuIcon>
			<MenuText primary={props.label} submenu={props.submenu} />
		</MenuItem>
	);
};

const UserMenuButton = ({ Icon, ...props }) => {
	return (
		<MenuItem button aria-label={props.label} onClick={props.onButtonClick}>
			<MenuIcon>
				<Icon />
			</MenuIcon>
			<MenuText primary={props.label} />
		</MenuItem>
	);
};

const commonLinks = [...LANDING_ROUTES];
const staticLinks = [...STATIC_ROUTES];

interface IProps {
	userData?: IUserData;
	isAuthenticated: boolean;
	onTeamspacesClick: () => void;
	onSettingClick: () => void;
	onLogout: () => void;
	close: (args?: any) => void;
}

export const MenuContent: React.FunctionComponent<IProps> = ({
	isAuthenticated, userData, onTeamspacesClick, onSettingClick, onLogout, close,
}) => {
	const invokeAndClose = (callback) => (...args) => {
		if (typeof callback === 'string') {
			window.open(callback, '_blank');
		} else if (typeof callback === 'function') {
			callback(...args);
		}
		close(...args);
	};

	let menuItems = [];

	if (isAuthenticated) {
		menuItems.push(
			<React.Fragment key="accountSettings">
				<MenuUser>
					<ListItemAvatar>
						<Avatar
							name={userData.name}
							size={26}
							url={userData.avatarUrl}
							fontSize={12}
						/>
					</ListItemAvatar>
					<MenuText primary={userData.username} />
				</MenuUser>
				<Divider />
				<UserMenuButton
					Icon={TeamspacesIcon}
					label="Teamspaces"
					onButtonClick={invokeAndClose(onTeamspacesClick)}
				/>
				<UserMenuButton
					Icon={SettingsIcon}
					label="Visual Settings"
					onButtonClick={invokeAndClose(onSettingClick)}
				/>
				<Divider />
			</React.Fragment>
		);
	}

	menuItems = menuItems.concat(commonLinks.map(({ path, title, ...itemProps }) => (
		<ExternalLink
			key={title}
			label={title}
			onButtonClick={invokeAndClose(path)}
			{...itemProps}
		/>
	)));

	menuItems.push(
		<NestedMenuItem
			key="nestedMenu"
			label="Privacy & Terms"
			icon={<PATIcon style={{ color: COLOR.BLACK_54 }} />}
			renderContent={staticLinks.map(({ path, title }, index) => (
				<ExternalLink
					key={index}
					label={title}
					onButtonClick={invokeAndClose(path)}
					submenu={1}
				/>
			))}
		/>
	);

	if (isAuthenticated) {
		menuItems.push(
			<React.Fragment key="logout">
				<Divider />
				<UserMenuButton
					Icon={LogoutIcon}
					label="Logout"
					onButtonClick={invokeAndClose(onLogout)}
				/>
			</React.Fragment>
		);
	}

	return (
		<>
			{menuItems}
		</>
	);
};
