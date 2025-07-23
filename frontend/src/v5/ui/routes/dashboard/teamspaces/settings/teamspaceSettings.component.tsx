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

import { TeamspaceSettings as V4TeamspaceSettings } from '@/v4/routes/teamspaceSettings';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { V5TeamspaceSettingsOverrides } from '@/v5/ui/v4Adapter/overrides/teamspaceSettings.overrides';
import { FormattedMessage } from 'react-intl';
import {
	useLocation,
	useMatch,
	useNavigate,
} from 'react-router-dom';
import { Header, Title } from '../projects/projectsList.styles';

export const TeamspaceSettings = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const match = useMatch('*');

	const isAdmin = TeamspacesHooksSelectors.selectIsTeamspaceAdmin();
	return (
		<V5TeamspaceSettingsOverrides isAdmin={isAdmin}>
			<Header>
				<Title>
					<FormattedMessage id="teamspaceSettings.title" defaultMessage="Teamspace Settings" />
				</Title>
			</Header>
			<V4TeamspaceSettings match={match} location={location} navigate={navigate} />
		</V5TeamspaceSettingsOverrides>
	);
};
