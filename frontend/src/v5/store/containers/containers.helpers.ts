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
	ContainerStatuses,
	FetchContainersContainerItemResponse,
	FetchContainerStatsResponse,
	IContainer,
} from '@/v5/store/containers/containers.types';
import { getNullableDate } from '@/v5/helpers/getNullableDate';

export const prepareSingleContainerData = (
	container: FetchContainersContainerItemResponse,
	stats?: FetchContainerStatsResponse,
): IContainer => ({
	...container,
	revisionsCount: stats?.revisions.total ?? 0,
	lastUpdated: getNullableDate(stats?.revisions.lastUpdated),
	latestRevision: stats?.revisions.latestRevision ?? '',
	type: stats?.type ?? '',
	code: stats?.code ?? '',
	status: stats?.status ?? ContainerStatuses.OK,
	units: stats?.units ?? '',
	hasStatsPending: !stats,
	errorResponse: stats?.errorReason && {
		message: stats.errorReason.message,
		date: getNullableDate(stats?.errorReason.timestamp),
	},
});

export const prepareContainersData = (
	containers: Array<FetchContainersContainerItemResponse>,
	stats?: FetchContainerStatsResponse[],
) => containers.map<IContainer>((container, index) => {
	const containerStats = stats?.[index];
	return prepareSingleContainerData(container, containerStats);
});
