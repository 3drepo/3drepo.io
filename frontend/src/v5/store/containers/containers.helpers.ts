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
	UploadStatuses,
	IContainer,
	ContainerStats,
	MinimumContainer,
} from '@/v5/store/containers/containers.types';
import { getNullableDate } from '@/v5/helpers/getNullableDate';

export const filterContainers = (federations: IContainer[], filterQuery: string) => (
	federations.filter((
		{ name, code, type },
	) => [name, code, type].join('').toLowerCase().includes(filterQuery.trim().toLowerCase()))
);

export const isBusyInBackend = (status: UploadStatuses) => {
	const busyInBackend = [
		UploadStatuses.QUEUED,
		UploadStatuses.PROCESSING,
		UploadStatuses.QUEUED_FOR_UNITY,
		UploadStatuses.UPLOADING,
		UploadStatuses.GENERATING_BUNDLES,
	];
	return busyInBackend.includes(status);
};

export const prepareSingleContainerData = (
	container: MinimumContainer,
	stats?: ContainerStats,
): IContainer => ({
	...container,
	revisionsCount: stats?.revisions.total ?? 0,
	lastUpdated: getNullableDate(stats?.revisions.lastUpdated),
	latestRevision: stats?.revisions.latestRevision ?? '',
	type: stats?.type ?? '',
	code: stats?.code ?? '',
	status: stats?.status ?? UploadStatuses.OK,
	unit: stats?.unit ?? '',
	hasStatsPending: !stats,
	errorResponse: stats?.errorReason && {
		message: stats.errorReason.message,
		date: getNullableDate(stats?.errorReason.timestamp),
	},
});

export const prepareContainersData = (
	containers: Array<MinimumContainer>,
	stats?: ContainerStats[],
) => containers.map<IContainer>((container, index) => {
	const containerStats = stats?.[index];
	return prepareSingleContainerData(container, containerStats);
});
