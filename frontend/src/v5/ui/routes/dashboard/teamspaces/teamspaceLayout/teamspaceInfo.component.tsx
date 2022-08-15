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
import StorageIcon from '@assets/icons/storage.svg';
import SeatsIcon from '@assets/icons/seats.svg';
import { TeamspaceParams } from '../../../routes.constants';
import { LimitsContainer, TeamspaceInfoContainer } from './teamspaceInfo.styles';
// import WarningIcon from '@assets/icons/warning.svg';

type ByteSizeType = {
	value: number,
	unit: string
};

type QuotaInfoType = {
	available: number | string;
	used: number;
};

type SeatsInfoProps = {
	seats: QuotaInfoType;
};

const SeatsText = ({ seats }: SeatsInfoProps) => {
	if (seats.available === 'unlimited') {
		return (<>Unlimited seats</>);
	}

	return (
		<FormattedMessage
			id="teamspace.info.storage"
			defaultMessage="{used} of {available} seats assigned"
			values={seats}
		/>
	);
};

type StorageInfoProps = {
	storage: QuotaInfoType;
};

const StorageText = ({ storage }: StorageInfoProps) => {
	if (storage.available === 'unlimited') {
		return (<>Unlimited storage</>);
	}

	const availableReadableData = byteSize(storage.available) as ByteSizeType;
	const usedReadableData = byteSize(storage.used) as ByteSizeType;

	return (
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
	);
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

	return (
		<TeamspaceInfoContainer>
			<Typography variant="h1">
				<FormattedMessage
					id="teamspace.info.name"
					defaultMessage="{teamspace} Teamspace"
					values={{ teamspace }}
				/>
			</Typography>
			<LimitsContainer>
				<StorageIcon />
				<StorageText storage={quota.data} />
				<SeatsIcon />
				<SeatsText seats={quota.seats} />
			</LimitsContainer>
		</TeamspaceInfoContainer>
	);
};
