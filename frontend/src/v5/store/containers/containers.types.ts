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
import { SurveyPoint, View } from '../store.types';

export enum UploadStatuses {
	OK = 'ok',
	FAILED = 'failed',
	UPLOADING = 'uploading',
	UPLOADED = 'uploaded',
	QUEUED = 'queued',
	PROCESSING = 'processing',
	GENERATING_BUNDLES = 'Generating Bundles',
	QUEUED_FOR_UNITY = 'Queued for Unity',
}

export interface IContainer {
	_id: string;
	name: string;
	latestRevision: string;
	revisionsCount?: number;
	lastUpdated: Date;
	type: string;
	code: string;
	status: UploadStatuses;
	isFavourite: boolean;
	role: string;
	hasStatsPending: boolean;
	errorResponse?: {
		message: string;
		date: Date | null;
	};
	category?: string;
	desc?: string;
	views?: View[];
	surveyPoint?: SurveyPoint;
	angleFromNorth?: number;
	defaultView?: string;
	unit?: string;
}

export interface MinimumContainer {
	_id: string,
	name: string,
	role: string,
	isFavourite: boolean
}

export type NewContainer = {
	name: string;
	unit: string;
	type: string;
	desc?: string;
	code?: string;
};

export type ContainerStats = {
	revisions: {
		total: number;
		lastUpdated: number;
		latestRevision: string;
	};
	type: string;
	errorReason?: {
		message: string;
		timestamp: number;
	};
	status: UploadStatuses;
	unit: string;
	code: string;
};

export type ContainerBackendSettings = {
	_id?: string;
	desc?: string;
	name?: string;
	surveyPoints?: SurveyPoint[];
	status?: UploadStatuses;
	timestamp?: number;
	type?: string;
	angleFromNorth: number;
	code?: string;
	unit?: string;
	defaultView?: string;
	errorReason?: {
		message: string;
		timestamp: number;
		errorCode: string;
	}
};

export type ContainerSettings = Omit<ContainerBackendSettings, 'surveyPoints'> & {
	surveyPoint: SurveyPoint;
	category?: string;
};

export type FetchContainerViewsResponseView = { views: View[] };
