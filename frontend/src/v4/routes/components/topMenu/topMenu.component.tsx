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

import { matchPath, Prompt } from 'react-router';
import { ROUTES } from '../../../constants/routes';
import { renderWhenTrue } from '../../../helpers/rendering';
import { clientConfigService } from '../../../services/clientConfig';
import { TooltipButton } from '../../teamspaces/components/tooltipButton/tooltipButton.component';
import { Logo } from '../logo/logo.component';
import Notifications from '../notifications/notifications.container';
import { Presentation } from '../presentation';
import { MainMenu } from './components/mainMenu/mainMenu.component';
import { VisualSettingsDialog } from './components/visualSettingsDialog/visualSettingsDialog.component';
import { BackIcon, Container } from './topMenu.styles';

interface IProps {
	currentUser: any;
	isInitialised: boolean;
	history: any;
	isFocusMode: boolean;
	isAuthenticated: boolean;
	isPresenting: boolean;
	visualSettings?: any;
	onLogout?: () => void;
	onLogoClick?: () => void;
	showDialog?: (config: any) => void;
	showConfirmDialog: (config) => void;
	updateSettings?: (settings: any) => void;
	pathname: string;
}

export class TopMenu extends React.PureComponent<IProps, any> {

	get isViewerPage() {
		return this.props.pathname.includes(ROUTES.VIEWER);
	}

	private wrapConfirmEndPresentation = (callback) => () => {
		const {showConfirmDialog, isPresenting} = this.props;

		if (isPresenting) {
			showConfirmDialog({
				title: `End Session?`,
				content: `This will end the session for all users. Continue?`,
				onConfirm: () => {
					// the actual .stopPresenting call is in presentation.sagas / reset() that gets called when leaving the viewergui
					callback();
				},
			});
		} else  {
			callback();
		}
	}

	public componentDidMount() {
		this.handleGoToHomepage = this.wrapConfirmEndPresentation(this.handleGoToHomepage);
		this.handleGoToTeamspaces = this.wrapConfirmEndPresentation(this.handleGoToTeamspaces);
	}

	public renderUserNavItems = renderWhenTrue(() => {
		return (
			<>
				<TooltipButton
					label="Back to teamspaces"
					Icon={BackIcon}
					action={this.handleGoToTeamspaces}
					id="top-menu-back-button"
				/>
				<Notifications id="top-menu-notifications-button" />
			</>
		);
	});

	public renderPresentationItem = renderWhenTrue(() => <Presentation />);

	public render() {
		const { isFocusMode, isAuthenticated, ...props } = this.props;

		const check = (location, action) => {
			if (matchPath(location.pathname, { path: ROUTES.MODEL_VIEWER })) {
				return true;
			}

			// this is to fix a bug with prompt that leaves the wrong url when using the back button:
			// in the case that you cancel the navigation props.history keeps the correct target page
			// while location changes to the back page
			setTimeout(() => {
				if (location !== this.props.history.location) {
					window.history.forward();
				}
			}, 1);

			return 'This will end the session for all users. Continue?';
		};

		return (
			<Container hidden={isFocusMode}>
				<Logo onClick={this.handleGoToHomepage} />
				{this.renderPresentationItem(clientConfigService.presenterEnabled && this.isViewerPage)}
				{this.renderUserNavItems(isAuthenticated)}

				<MainMenu
					{...props}
					onTeamspacesClick={this.handleGoToTeamspaces}
					onSettingClick={this.handleOpenSettingsDialog}
					isAuthenticated={isAuthenticated}
					id="top-menu-profile-button"
				/>

				<Prompt when={this.props.isPresenting} message={check}  />
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
