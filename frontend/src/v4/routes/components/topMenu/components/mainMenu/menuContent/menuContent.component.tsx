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
import { FunctionComponent, Fragment } from 'react';
import Divider from '@mui/material/Divider';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import LogoutIcon from '@mui/icons-material/ExitToApp';
import PATIcon from '@mui/icons-material/InsertDriveFileOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import TeamspacesIcon from '@mui/icons-material/ViewList';

import { LANDING_ROUTES, STATIC_ROUTES } from '../../../../../../services/staticPages';
import { COLOR } from '../../../../../../styles';
import { Avatar } from '../../../../avatar/avatar.component';
import { NestedMenuItem } from '../../nestedMenuItem/nestedMenuItem.component';
import { IUserData } from '../mainMenu.helpers';
import { MenuIcon, MenuItem, MenuText, MenuUser } from './menuContent.styles';

type ExternalLinkProps = {
	label: string;
	icon?: any;
	submenu?: any;
	onButtonClick: () => void;
}

const ExternalLink = ({ label, icon, onButtonClick, submenu }: ExternalLinkProps) => {
	const Icon = icon || Fragment;
	const iconProps = icon ? { style: { color: COLOR.BLACK_54 } } : {};
	return (
		<MenuItem aria-label={label} onClick={onButtonClick}>
			<MenuIcon>
				<Icon {...iconProps} />
			</MenuIcon>
			<MenuText primary={label} submenu={submenu} />
		</MenuItem>
	);
};

const UserMenuButton = ({ Icon, label, onButtonClick }) => {
	return (
		<MenuItem aria-label={label} onClick={onButtonClick}>
			<MenuIcon>
				<Icon />
			</MenuIcon>
			<MenuText primary={label} />
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

export const MenuContent: FunctionComponent<IProps> = ({
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
			<Fragment key="accountSettings">
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
			</Fragment>
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
			<Fragment key="logout">
				<Divider />
				<UserMenuButton
					Icon={LogoutIcon}
					label="Logout"
					onButtonClick={invokeAndClose(onLogout)}
				/>
			</Fragment>
		);
	}

	return (
		<>
			{menuItems}
		</>
	);
};
