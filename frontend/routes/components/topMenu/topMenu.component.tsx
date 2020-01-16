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

import React from 'react';

import { ROUTES } from '../../../constants/routes';
import { renderWhenTrue } from '../../../helpers/rendering';
import { TooltipButton } from '../../teamspaces/components/tooltipButton/tooltipButton.component';
import { Logo } from '../logo/logo.component';
import Notifications from '../notifications/notifications.container';
import { MainMenu } from './components/mainMenu/mainMenu.component';
import { VisualSettingsDialog } from './components/visualSettingsDialog/visualSettingsDialog.component';
import { BackIcon, Container } from './topMenu.styles';

interface IProps {
	currentUser: any;
	isInitialised: boolean;
	history: any;
	isFocusMode: boolean;
	isAuthenticated: boolean;
	visualSettings?: any;
	onLogout?: () => void;
	onLogoClick?: () => void;
	showDialog?: (config: any) => void;
	updateSettings?: (settings: any) => void;
}

export class TopMenu extends React.PureComponent<IProps, any> {
	public renderUserNavItems = renderWhenTrue(() => {
		return (
			<>
				<TooltipButton
					label="Back to teamspaces"
					Icon={BackIcon}
					action={this.handleGoToTeamspaces}
				/>
				<Notifications />
			</>
		);
	});

	public render() {
		const { isFocusMode, isAuthenticated, ...props } = this.props;
		return (
			<Container hidden={isFocusMode}>
				<Logo onClick={this.handleGoToHomepage} />

				{this.renderUserNavItems(isAuthenticated)}

				<MainMenu
					{...props}
					onTeamspacesClick={this.handleGoToTeamspaces}
					onSettingClick={this.handleOpenSettingsDialog}
					isAuthenticated={isAuthenticated}
				/>
			</Container>
		);
	}

	private handleGoToTeamspaces = () => {
		this.props.history.push(ROUTES.TEAMSPACES);
	}

	private handleGoToHomepage = () => {
		this.props.history.push(ROUTES.HOME);
	}

	private handleOpenSettingsDialog = () => {
		const { visualSettings, updateSettings, currentUser } = this.props;
		this.props.showDialog({
			title: 'Visual Settings',
			template: VisualSettingsDialog,
			data: {
				visualSettings,
				updateSettings,
				currentUser: currentUser.username
			}
		});
	}
}
