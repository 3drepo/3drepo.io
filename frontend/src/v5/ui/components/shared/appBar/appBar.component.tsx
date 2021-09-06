/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import Logo from '@assets/icons/logo.svg';
import { AppBar as MuiAppBar } from '@material-ui/core';
import IntercomIcon from '@assets/icons/intercom.svg';
import NotificationsIcon from '@assets/icons/notifications.svg';

import { CircleButton } from '@/v5/ui/controls/circleButton';
import { AvatarButton } from '@/v5/ui/controls/avatarButton';
import { Items } from './appBar.styles';
import { TopNavigation } from '../topNavigation';

export const AppBar = (): JSX.Element => (
	<MuiAppBar color="secondary">
		<Items>
			<Logo />
		</Items>
		<Items>
			<TopNavigation links={[{ title: 'Containers', to: '/containers' }, { title: 'Settings', to: '/settings' }]} />
			<CircleButton variant="contrast" aria-label="intercom">
				<IntercomIcon />
			</CircleButton>
			<CircleButton variant="contrast" aria-label="notifications">
				<NotificationsIcon />
			</CircleButton>
			<AvatarButton> GH </AvatarButton>
		</Items>
	</MuiAppBar>
);
