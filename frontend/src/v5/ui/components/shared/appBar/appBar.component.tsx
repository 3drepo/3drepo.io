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
import { Link } from 'react-router-dom';
import { AuthHooksSelectors, CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';
import { DASHBOARD_ROUTE, LOGIN_PATH } from '@/v5/ui/routes/routes.constants';
import { UserMenu } from '../userMenu';
import { AppBarContainer, Items, LogoIcon } from './appBar.styles';
import { BreadcrumbsRouting } from '../breadcrumbsRouting/breadcrumbsRouting.component';
import { Notifications } from './notifications/notifications.component';
import { Intercom } from './intercom/intercom.component';

export const AppBar = (): JSX.Element => {
	const user = CurrentUserHooksSelectors.selectCurrentUser();
	const isAuthenticated = AuthHooksSelectors.selectIsAuthenticated();

	return (
		<AppBarContainer>
			<Items>
				<Link to={isAuthenticated ? DASHBOARD_ROUTE : LOGIN_PATH}>
					<LogoIcon />
				</Link>
				{ isAuthenticated && (
					<BreadcrumbsRouting />
				)}
			</Items>
			{ isAuthenticated && (
				<Items>
					<Intercom />
					<Notifications />
					<UserMenu user={user} />
				</Items>
			)}
		</AppBarContainer>
	);
};
