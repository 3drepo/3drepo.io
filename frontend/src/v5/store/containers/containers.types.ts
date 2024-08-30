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
import { Role } from '../currentUser/currentUser.types';
import { SurveyPoint, View } from '../store.types';

export enum ContainerUploadStatus {
	OK = 'ok',
	FAILED = 'failed',
	UPLOADING = 'uploading',
	UPLOADED = 'uploaded',
	QUEUED = 'queued',
	PROCESSING = 'processing',
	GENERATING_BUNDLES = 'Generating Bundles',
	QUEUED_FOR_UNITY = 'Queued for Unity',
}

export const CONTAINER_TYPES = [
	{
		value: 'Uncategorised',
		name: formatMessage({ id: 'containers.type.uncategorised', defaultMessage: 'Uncategorised' }),
	},
	{
		value: 'Architectural',
		name: formatMessage({ id: 'containers.type.architectural', defaultMessage: 'Architectural' }),
	},
	{
		value: 'Existing',
		name: formatMessage({ id: 'containers.type.existing', defaultMessage: 'Existing' }),
	},
	{
		value: 'GIS',
		name: formatMessage({ id: 'containers.type.gis', defaultMessage: 'GIS' }),
	},
	{
		value: 'Infrastructure',
		name: formatMessage({ id: 'containers.type.infrastructure', defaultMessage: 'Infrastructure' }),
	},
	{
		value: 'Interior',
		name: formatMessage({ id: 'containers.type.interior', defaultMessage: 'Interior' }),
	},
	{
		value: 'Landscape',
		name: formatMessage({ id: 'containers.type.landscape', defaultMessage: 'Landscape' }),
	},
	{
		value: 'MEP',
		name: formatMessage({ id: 'containers.type.mep', defaultMessage: 'MEP' }),
	},
	{
		value: 'Mechanical',
		name: formatMessage({ id: 'containers.type.mechanical', defaultMessage: 'Mechanical' }),
	},
	{
		value: 'Structural',
		name: formatMessage({ id: 'containers.type.structural', defaultMessage: 'Structural' }),
	},
	{
		value: 'Survey',
		name: formatMessage({ id: 'containers.type.survey', defaultMessage: 'Survey' }),
	},
	{
		value: 'Other',
		name: formatMessage({ id: 'containers.type.other', defaultMessage: 'Other' }),
	},
];

export const CONTAINER_UNITS = [
	{
		value: 'mm',
		name: formatMessage({ id: 'containers.unit.name.mm', defaultMessage: 'Millimetres' }),
	},
	{
		value: 'cm',
		name: formatMessage({ id: 'containers.unit.name.cm', defaultMessage: 'Centimetres' }),
	},
	{
		value: 'dm',
		name: formatMessage({ id: 'containers.unit.name.dm', defaultMessage: 'Decimetres' }),
	},
	{
		value: 'm',
		name: formatMessage({ id: 'containers.unit.name.m', defaultMessage: 'Metres' }),
	},
	{
		value: 'ft',
		name: formatMessage({ id: 'containers.unit.name.ft', defaultMessage: 'Feet and Inches' }),
	},
];

export interface MinimumContainer {
	_id: string,
	name: string,
	role: Role,
	isFavourite: boolean
}

export interface IContainer extends MinimumContainer {
	latestRevision: string;
	revisionsCount?: number;
	lastUpdated: Date;
	type: string;
	code: string;
	status: ContainerUploadStatus;
	hasStatsPending: boolean;
	errorReason?: {
		message: string;
		timestamp: Date | null;
	};
	desc?: string;
	views?: View[];
	surveyPoint?: SurveyPoint;
	angleFromNorth?: number;
	defaultView?: string;
	unit?: string;
}

export type NewContainer = {
	_id?: string;
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
	status: ContainerUploadStatus;
	unit: string;
	code: string;
};

export type ContainerBackendSettings = {
	_id?: string;
	desc?: string;
	name?: string;
	surveyPoints?: SurveyPoint[];
	status?: ContainerUploadStatus;
	timestamp?: number;
	type?: string;
	angleFromNorth?: number;
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
	surveyPoint?: SurveyPoint;
};

export type FetchContainerViewsResponseView = { views: View[] };
