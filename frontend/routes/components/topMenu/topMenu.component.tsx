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
import { Logo } from '../logo/logo.component';
import Notifications from '../notifications/notifications.container';
import { TooltipButton } from '../../teamspaces/components/tooltipButton/tooltipButton.component';
import { Container, BackIcon } from './topMenu.styles';

interface IProps {
	currentUser: any;
	logoUrl?: string;
	history: any;
	visualSettings?: any;
	onLogout?: () => void;
	onLogoClick?: () => void;
	updateSettings?: (settings: any) => void;
}

export class TopMenu extends React.PureComponent<IProps, any> {
	public render() {
		const { logoUrl, onLogoClick, ...userMenuProps } = this.props;
		return (
			<Container>
				<Logo onClick={onLogoClick} />

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
			</Container>
		);
	}

	private handleBackToTeamspaces = () => {
		this.props.history.push('/dashboard/teamspaces');
	}
}
