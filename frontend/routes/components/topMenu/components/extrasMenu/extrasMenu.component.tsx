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
import Settings from '@material-ui/icons/Settings';
import ContactSupport from '@material-ui/icons/ContactSupport';

import { ButtonMenu } from '../../../buttonMenu/buttonMenu.component';
import {
	MenuContent,
	MenuIcon,
	MenuItem,
	MenuText,
	MenuUser,
	UserIcon
} from './extrasMenu.styles';
import { Avatar } from '../../../avatar/avatar.component';
import { VisualSettingsDialog } from '../visualSettingsDialog/visualSettingsDialog.component';
import { STATIC_ROUTES } from '../../../../../services/staticPages';
import { LANDING_PAGES } from '../../../externalLinks/externalLinks.constants';

const UserButton = ({ IconProps, Icon, ...props }) => (
	<IconButton
		{...props}
		aria-label="Toggle user menu"
		aria-haspopup="true"
	>
		<UserIcon {...IconProps} size="small" />
	</IconButton>
);

const UserMenuButton = ({ ...props }) => {
	return (
		<MenuItem button={true} aria-label={props.label} onClick={props.onButtonClick}>
			<MenuText primary={props.label} />
		</MenuItem>
	);
};

const UserMenuContent = (props) => {
	const invokeAndClose = (path) => (...args) => {
		window.open(path, '_blank');
		props.close(...args);
	};

	const links = [
		...STATIC_ROUTES,
		...LANDING_PAGES
	];

	return (
		<MenuContent component="nav">
			{links.map(({ path, title }, index) => (
				<UserMenuButton
					key={index}
					label={title}
					onButtonClick={invokeAndClose(path)}
				/>
			))}
		</MenuContent>
	);
};

interface IProps {
	currentUser: any;
	onLogout?: () => void;
	onTeamspacesClick?: () => void;
	showDialog?: (config: any) => void;
	updateSettings?: (settings: any) => void;
	visualSettings?: any;
}

export class ExtrasMenu extends React.PureComponent<IProps, any> {
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
			...this.props
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
