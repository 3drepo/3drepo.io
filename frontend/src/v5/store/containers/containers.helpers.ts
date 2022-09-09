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
	ContainerBackendSettings,
	ContainerSettings,
} from '@/v5/store/containers/containers.types';
import { getNullableDate } from '@/v5/helpers/getNullableDate';
import filesize from 'filesize';
import { formatMessage } from '@/v5/services/intl';

export const CONTAINERS_SEARCH_FIELDS = ['code', 'type', 'name', 'desc', 'latestRevision'];

export const canUploadToBackend = (status?: UploadStatuses): boolean => {
	const statusesForUpload = [
		UploadStatuses.OK,
		UploadStatuses.FAILED,
	];

	return statusesForUpload.includes(status);
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

export const prepareContainerSettingsForFrontend = ({
	surveyPoints,
	...otherProps
}: ContainerBackendSettings) => ({
	surveyPoint: surveyPoints?.[0],
	...otherProps,
});

export const prepareContainerSettingsForBackend = ({
	surveyPoint,
	...otherProps
}: ContainerSettings) => ({
	surveyPoints: [surveyPoint],
	...otherProps,
});

export const filesizeTooLarge = (file: File): string => {
	const { uploadSizeLimit } = ClientConfig;
	return (file.size > uploadSizeLimit) && formatMessage({
		id: 'validation.revisions.file.error.tooLarge',
		defaultMessage: 'File exceeds size limit of {sizeLimit}',
	}, { sizeLimit: filesize(uploadSizeLimit) });
};
