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
	FetchFederationsResponse,
	FetchFederationStatsResponse,
	IFederation,
} from '@/v5/store/federations/federations.types';
import {
	UploadStatuses,
} from '@/v5/store/containers/containers.types';
import { getNullableDate } from '@/v5/helpers/getNullableDate';

export const filterFederations = (federations: IFederation[], filterQuery: string) => (
	federations.filter((
		{ name, code, category },
	) => [name, code, category].join('').toLowerCase().includes(filterQuery.trim().toLowerCase()))
);

export const prepareFederationsData = (
	federations: FetchFederationsResponse['federations'],
	stats?: FetchFederationStatsResponse[],
) => federations.map<IFederation>((federation, index) => {
	const federationStats = stats?.[index];
	return {
		...federation,
		code: federationStats?.code ?? '',
		status: federationStats?.status ?? UploadStatuses.OK,
		subModels: federationStats?.subModels ?? [],
		containers: federationStats?.subModels.length ?? 0,
		issues: federationStats?.tickets.issues ?? 0,
		risks: federationStats?.tickets.risks ?? 0,
		lastUpdated: getNullableDate(federationStats?.lastUpdated),
		category: federationStats?.category ?? '',
	};
});
