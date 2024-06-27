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

import { UploadStatus } from '../containers/containers.types';
import { Role } from '../currentUser/currentUser.types';
import { SurveyPoint, View } from '../store.types';

export type FederationBackendSettings = {
	_id?: string;
	desc?: string;
	name?: string;
	surveyPoints?: SurveyPoint[];
	status?: UploadStatus;
	timestamp?: number;
	type?: string;
	angleFromNorth?: number;
	code?: string;
	unit?: string;
	author?: string;
	defaultView?: string;
	errorReason?: {
		message: string;
		timestamp: number;
		errorCode: string;
	}
};

export type FederationRevision = Pick<FederationBackendSettings, '_id' | 'timestamp' | 'author' >;

export type GroupedContainer = {
	_id: string;
	group?: string;
};

export interface IFederation {
	_id: string;
	desc?: string;
	name: string;
	role: Role;
	isFavourite: boolean;
	code?: string;
	status: UploadStatus;
	containers: GroupedContainer[];
	issues: number;
	risks: number;
	category: string;
	lastUpdated: Date;
	hasStatsPending: boolean;
	views?: View[];
	surveyPoint?: SurveyPoint;
	angleFromNorth?: number;
	defaultView?: string;
	unit?: string;
	revision?: FederationRevision;
}

export type NewFederation = {
	name: string;
	unit: string;
	desc?: string;
	code?: string;
};

export type NewFederationRealtime = NewFederation & {
	_id: string;
};

export type FederationSettings = Omit<FederationBackendSettings, 'surveyPoints'> & {
	surveyPoint?: SurveyPoint;
};

export type MinimumFederation = Pick<IFederation, '_id' | 'name' | 'role' | 'isFavourite'>;

export type FederationStats = {
	code: string;
	desc: string;
	status: UploadStatus;
	containers: GroupedContainer[];
	tickets: {
		issues: number;
		risks: number;
	};
	category: string;
	lastUpdated: number;
};
