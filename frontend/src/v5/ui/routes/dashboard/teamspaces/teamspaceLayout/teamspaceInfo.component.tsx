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
import { TeamspacesActionsDispatchers } from '@/v5/services/actionsDispatchers/teamspacesActions.dispatchers';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks/teamspacesSelectors.hooks';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { TeamspaceParams } from '../../../routes.constants';
import { TeamspaceInfoContainer } from './teamspaceInfo.styles';

export const TeamspaceInfo = () => {
	const { teamspace } = useParams<TeamspaceParams>();
	const isQuotaLoaded = TeamspacesHooksSelectors.selectCurrentQuotaLoaded();

	useEffect(() => {
		if (isQuotaLoaded || !teamspace) return;
		TeamspacesActionsDispatchers.fetchQuota(teamspace);
	}, [isQuotaLoaded, teamspace]);

	return (
		<TeamspaceInfoContainer>
			<h1>
				<FormattedMessage
					id="teamspace.definition"
					defaultMessage="{teamspace} Teamspace"
					values={{ teamspace }}
				/>
			</h1>
		</TeamspaceInfoContainer>
	);
};
