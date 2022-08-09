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
import LogoIcon from '@assets/icons/logo.svg';
import NotificationsIcon from '@assets/icons/notifications.svg';
import { CircleButton } from '@/v5/ui/controls/circleButton';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks/currentUserSelectors.hooks';
import { DASHBOARD_ROUTE } from '@/v5/ui/routes/routes.constants';
import { UserMenu } from '../userMenu';
import { Items, AppBarContainer } from './appBar.styles';
import { BreadcrumbsRouting } from '../breadcrumbsRouting/breadcrumbsRouting.component';

export const AppBar = (): JSX.Element => {
	const user = CurrentUserHooksSelectors.selectCurrentUser();

	return (
		<AppBarContainer position="static">
			<Items>
				<Link to={DASHBOARD_ROUTE}>
					<LogoIcon />
				</Link>
				<BreadcrumbsRouting />
			</Items>
			<Items>
				<CircleButton variant="contrast" aria-label="notifications">
					<NotificationsIcon />
				</CircleButton>
				<UserMenu user={user} />
			</Items>
		</AppBarContainer>
	);
};
