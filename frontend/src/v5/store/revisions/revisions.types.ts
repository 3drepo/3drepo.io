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
		name: formatMessage({ id: 'revision.lod.default', defaultMessage: 'Default' }),
	},
	{
		value: '1',
		name: formatMessage({ id: 'revision.lod.veryLow', defaultMessage: 'Very Low' }),
	},
	{
		value: '2',
		name: formatMessage({ id: 'revision.lod.low', defaultMessage: 'Low' }),
	},
	{
		value: '3',
		name: formatMessage({ id: 'revision.lod.medium', defaultMessage: 'Medium' }),
	},
	{
		value: '4',
		name: formatMessage({ id: 'revision.lod.high', defaultMessage: 'High' }),
	},
	{
		value: '5',
		name: formatMessage({ id: 'revision.lod.veryHigh', defaultMessage: 'Very High' }),
	},
	{
		value: '6',
		name: formatMessage({ id: 'revision.lod.maximum', defaultMessage: 'Maximum' }),
	},
];

export interface IRevision {
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

export type FetchRevisionsPayload = {
	teamspace: string;
	projectId: string;
	containerId: string;
};

export type RevisionVoidStatusPayload = {
	teamspace?: string;
	projectId: string;
	containerId: string;
	revisionId: string;
	isVoid: boolean;
};

export type CreateRevisionBody = {
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

export type CreateRevisionPayload = {
	teamspace: string;
	projectId: string;
	uploadId: string;
	body: CreateRevisionBody;
};

export type IRevisionUpdate = Partial<Omit<IRevision, '_id'>> & {
	_id: string;
};
