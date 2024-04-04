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

import { formatMessage } from '@/v5/services/intl';

export const LOD_VALUES = [
	{
		value: '0',
		name: formatMessage({ id: 'containerRevision.lod.default', defaultMessage: 'Default' }),
	},
	{
		value: '1',
		name: formatMessage({ id: 'containerRevision.lod.veryLow', defaultMessage: 'Very Low' }),
	},
	{
		value: '2',
		name: formatMessage({ id: 'containerRevision.lod.low', defaultMessage: 'Low' }),
	},
	{
		value: '3',
		name: formatMessage({ id: 'containerRevision.lod.medium', defaultMessage: 'Medium' }),
	},
	{
		value: '4',
		name: formatMessage({ id: 'containerRevision.lod.high', defaultMessage: 'High' }),
	},
	{
		value: '5',
		name: formatMessage({ id: 'containerRevision.lod.veryHigh', defaultMessage: 'Very High' }),
	},
	{
		value: '6',
		name: formatMessage({ id: 'containerRevision.lod.maximum', defaultMessage: 'Maximum' }),
	},
];

export interface IContainerRevision {
	_id: string;
	timestamp: Date;
	tag: string;
	author: string;
	desc?: string;
	void?: boolean;
	format: string;
}

export interface IUploadStatus {
	isComplete: boolean;
	errorMessage?: string;
	progress: number;
}

export type CreateContainerRevisionBody = {
	revisionTag: string;
	revisionDesc?: string;
	file: File;
	importAnimations?: boolean;
	timezone?: string;
	lod?: string;

	containerId?: string;
	containerName: string;
	containerType: string;
	containerUnit: string;
	containerDesc?: string;
	containerCode?: string;
};

export type CreateContainerRevisionPayload = {
	teamspace: string;
	projectId: string;
	uploadId: string;
	body: CreateContainerRevisionBody;
};

export type IContainerRevisionUpdate = Partial<Omit<IContainerRevision, '_id'>> & {
	_id: string;
};

export type DestinationOption = {
	containerId: string;
	containerName: string;
	containerUnit?: string;
	containerType?: string;
	containerDesc?: string;
	containerCode?: string;
	latestRevision: string;
};

export type UploadItemFields = CreateContainerRevisionBody & {
	uploadId: string;
	progress: number;
	extension: string;
};

