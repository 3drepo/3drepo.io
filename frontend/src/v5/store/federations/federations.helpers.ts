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

import {
	FederationStats,
	IFederation,
	MinimumFederation,
	FederationBackendSettings,
	FederationSettings,
	NewFederation,
} from '@/v5/store/federations/federations.types';
import { UploadStatuses } from '@/v5/store/containers/containers.types';
import { getNullableDate } from '@/v5/helpers/getNullableDate';
import { Role } from '../currentUser/currentUser.types';

export const FEDERATION_SEARCH_FIELDS = ['code', 'name', 'desc', 'category'];

export const prepareNewFederation = (
	newFederation: NewFederation,
	federationId?: string,
): IFederation => (
	{
		...newFederation,
		_id: federationId || '',
		status: UploadStatuses.OK,
		containers: [],
		tickets: 0,
		lastUpdated: new Date(),
		category: '',
		hasStatsPending: false,
		role: Role.ADMIN,
		isFavourite: false,
	}
);

export const prepareSingleFederationData = (
	federation: MinimumFederation,
	stats?: FederationStats,
): IFederation => {
	const containers = stats?.containers ?? (federation as any).containers ?? [];

	return {
		...federation,
		code: stats?.code ?? '',
		desc: stats?.desc ?? '',
		status: stats?.status ?? UploadStatuses.OK,
		tickets: stats?.tickets ?? 0,
		containers,
		lastUpdated: getNullableDate(stats?.lastUpdated),
		category: stats?.category ?? '',
		hasStatsPending: !stats,
	};
};

export const prepareFederationsData = (
	federations: Array<MinimumFederation>,
	stats?: FederationStats[],
) => federations.map<IFederation>((federation, index) => {
	const federationStats = stats?.[index];
	return prepareSingleFederationData(federation, federationStats);
});

export const prepareFederationSettingsForFrontend = ({
	surveyPoints,
	...otherProps
}: FederationBackendSettings):FederationSettings => ({
	surveyPoint: surveyPoints?.[0],
	...otherProps,
});

export const prepareFederationSettingsForBackend = ({
	surveyPoint,
	...otherProps
}: FederationSettings) => {
	if (!surveyPoint) return otherProps;
	return {
		surveyPoints: [surveyPoint],
		...otherProps,
	};
};
