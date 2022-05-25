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

export interface IFederation {
	_id: string;
	desc?: string;
	name: string;
	role: string;
	isFavourite: boolean;
	code: string;
	status: string;
	containers: string[];
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
}

export type FederationBackendSettings = {
	_id?: string;
	desc?: string;
	name?: string;
	surveyPoints?: SurveyPoint[];
	status?: string;
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

export type FederationSettings = Omit<FederationBackendSettings, 'surveyPoints'> & {
	surveyPoint: SurveyPoint;
};

export type MinimumFederation = Pick<IFederation, '_id' | 'name' | 'role' | 'isFavourite'>;

export type FederationStats = {
	code: string;
	status: string;
	containers: string[];
	tickets: {
		issues: number;
		risks: number;
	};
	category: string;
	lastUpdated: number;
};
