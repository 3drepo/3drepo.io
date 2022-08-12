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
import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import byteSize from 'byte-size';
import { TeamspaceParams } from '../../../routes.constants';
import { TeamspaceInfoContainer } from './teamspaceInfo.styles';

type ByteSizeType = {
	value: number,
	unit: string
};

export const TeamspaceInfo = () => {
	const { teamspace } = useParams<TeamspaceParams>();
	const quota = TeamspacesHooksSelectors.selectCurrentQuota();
	const quotaLoaded = !!quota;

	useEffect(() => {
		if (quotaLoaded || !teamspace) return;
		TeamspacesActionsDispatchers.fetchQuota(teamspace);
	}, [quotaLoaded, teamspace]);

	if (!quotaLoaded) {
		return <>loading...</>;
	}

	const availableReadableData = byteSize(quota.data.available) as ByteSizeType;
	const usedReadableData = byteSize(quota.data.used) as ByteSizeType;

	return (
		<TeamspaceInfoContainer>
			<Typography variant="h1">
				<FormattedMessage
					id="teamspace.info.name"
					defaultMessage="{teamspace} Teamspace"
					values={{ teamspace }}
				/>
			</Typography>
			<FormattedMessage
				id="teamspace.info.storage"
				defaultMessage="{used} {usedUnits} of {available} {availableUnits} used"
				values={
					{
						used: usedReadableData.value,
						usedUnits: usedReadableData.unit,
						available: availableReadableData.value,
						availableUnits: availableReadableData.unit,
					}
				}
			/>
			<FormattedMessage
				id="teamspace.info.storage"
				defaultMessage="{used} of {available} seats assigned"
				values={quota.seats}
			/>
		</TeamspaceInfoContainer>
	);
};
