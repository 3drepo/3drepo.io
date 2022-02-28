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
import { AppBar as MuiAppBar } from '@material-ui/core';

import LogoIcon from '@assets/icons/logo.svg';
import IntercomIcon from '@assets/icons/intercom.svg';
import NotificationsIcon from '@assets/icons/notifications.svg';
import { CircleButton } from '@/v5/ui/controls/circleButton';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks/currentUserSelectors.hooks';
import { UserMenu } from '../userMenu';
import { Items } from './appBar.styles';
import { Breadcrumbs } from '../breadcrumbs';

export const AppBar = (): JSX.Element => {
	const user = CurrentUserHooksSelectors.selectCurrentUser();
	return (
		<MuiAppBar position="static">
			<Items>
				<LogoIcon />
				<Breadcrumbs />
			</Items>
			<Items>
				<CircleButton variant="contrast" aria-label="intercom">
					<IntercomIcon />
				</CircleButton>
				<CircleButton variant="contrast" aria-label="notifications">
					<NotificationsIcon />
				</CircleButton>
				<UserMenu user={user} />
			</Items>
		</MuiAppBar>
	);
};
