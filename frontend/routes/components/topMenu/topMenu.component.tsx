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

import { UserMenu } from './components/userMenu/userMenu.component';
import { ExtrasMenu } from './components/extrasMenu/extrasMenu.component';
import { Logo } from '../logo/logo.component';
import Notifications from '../notifications/notifications.container';
import { TooltipButton } from '../../teamspaces/components/tooltipButton/tooltipButton.component';
import { Container, BackIcon } from './topMenu.styles';
import { ROUTES } from '../../../constants/routes';
import { renderWhenTrue } from '../../../helpers/rendering';

interface IProps {
	currentUser: any;
	history: any;
	isFocusMode: boolean;
	isAuthenticated: boolean;
	visualSettings?: any;
	logoUrl?: string;
	onLogout?: () => void;
	onLogoClick?: () => void;
	updateSettings?: (settings: any) => void;
}

export class TopMenu extends React.PureComponent<IProps, any> {
	public renderUserMenu = renderWhenTrue(() => {
		const { logoUrl, onLogoClick, isFocusMode, isAuthenticated, ...userMenuProps } = this.props;
		return (
			<>
				<TooltipButton
					label="Back to teamspaces"
					Icon={BackIcon}
					action={this.handleBackToTeamspaces}
				/>
				<Notifications />
				<UserMenu
					{...userMenuProps}
					onTeamspacesClick={this.props.onLogoClick}
				/>
			</>
		);
	});

	public render() {
		const { logoUrl, onLogoClick, isFocusMode, isAuthenticated, ...userMenuProps } = this.props;
		return (
			<Container hidden={isFocusMode}>
				<Logo onClick={onLogoClick} />

				{this.renderUserMenu(isAuthenticated)}

				<ExtrasMenu
					{...userMenuProps}
					onTeamspacesClick={this.props.onLogoClick}
				/>
			</Container>
		);
	}

	private handleBackToTeamspaces = () => {
		this.props.history.push(ROUTES.TEAMSPACES);
	}
}
