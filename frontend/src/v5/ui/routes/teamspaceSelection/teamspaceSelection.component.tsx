/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks/currentUserSelectors.hooks';
import { AppBar } from '@components/shared/appBar';
import { ModalsDispatcher } from '@components/shared/modals';
import { TeamspaceList } from '@components/teamspace/teamspaceList/teamspaceList.component';
import { FormattedMessage } from 'react-intl';
import { Content, WelcomeMessage } from './teamspaceSelection.styles';

export const TeamspaceSelection = (): JSX.Element => {
	const firstName = CurrentUserHooksSelectors.selectFirstName();
	return (
		<>
			<AppBar />
			<Content>
				<WelcomeMessage>
					{
						firstName ? (
							<FormattedMessage id="teamspaces.welcome.name" defaultMessage="Welcome back, {firstName}!" values={{ firstName }} />
						) : (
							<FormattedMessage id="teamspaces.welcome.noName" defaultMessage="Welcome back!" />
						)
					}
				</WelcomeMessage>
				<TeamspaceList />
			</Content>
			<ModalsDispatcher />
		</>
	);
};
