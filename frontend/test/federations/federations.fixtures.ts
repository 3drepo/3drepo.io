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

import * as faker from 'faker';
import { UploadStatuses } from '@/v5/store/containers/containers.types';
import {
	FederationBackendSettings,
	FederationSettings,
	FederationStats,
	IFederation,
	NewFederation,
} from '@/v5/store/federations/federations.types';
import { times } from 'lodash';
import { FetchFederationViewsResponse } from '@/v5/services/api/federations';
import { EMPTY_VIEW } from '@/v5/store/store.helpers';
import { Role } from '@/v5/store/currentUser/currentUser.types';

export const federationMockFactory = (overrides?: Partial<IFederation>): IFederation => ({
	_id: faker.datatype.uuid(),
	name: faker.random.words(3),
	desc: faker.random.words(3),
	role: faker.random.arrayElement([Role.ADMIN, Role.COLLABORATOR]),
	lastUpdated: faker.date.past(2),
	status: UploadStatuses.OK,
	code: faker.datatype.uuid(),
	category: faker.random.words(2),
	containers: prepareMockContainers(),
	isFavourite: faker.datatype.boolean(),
	issues: faker.datatype.number(120),
	risks: faker.datatype.number(120),
	hasStatsPending: false,
	views: [EMPTY_VIEW],
	defaultView: EMPTY_VIEW._id,
	angleFromNorth: faker.datatype.number({ min: 0, max: 360 }),
	surveyPoint: {
		latLong: [
			faker.datatype.number({ min: -100, max: 100 }),
			faker.datatype.number({ min: -100, max: 100 }),
		],
		position: [
			faker.datatype.number({ min: -100, max: 100 }),
			faker.datatype.number({ min: -100, max: 100 }),
			faker.datatype.number({ min: -100, max: 100 }),
		],
	},
	unit: faker.random.arrayElement(['mm', 'cm', 'dm', 'm', 'ft']),
	...overrides,
});

export const prepareMockStatsReply = (federation: IFederation): FederationStats => ({
	containers: federation.containers,
	tickets: {
		issues: federation.issues,
		risks: federation.risks,
	},
	lastUpdated: federation.lastUpdated.valueOf(),
	category: federation.category,
	status: federation.status,
	code: federation.code,
	desc: federation.desc,
});

export const prepareMockContainers = (min = 1, max = 10): string[] => (
	times(faker.datatype.number({ max, min }), () => faker.datatype.uuid()) 
);

export const prepareMockViewsReply = (federation: IFederation): FetchFederationViewsResponse => ({
	views: federation.views,
});

const prepareMockSettingsWithoutSurveyPoint = (federation: IFederation): Omit<FederationSettings, 'surveyPoint'> => ({
	angleFromNorth: federation.angleFromNorth,
	defaultView: federation.defaultView,
	unit: federation.unit,
	name: federation.name,
	code: federation.code,
	desc: federation.desc,
});

export const prepareMockSettingsReply = (federation: IFederation): FederationSettings => ({
	...prepareMockSettingsWithoutSurveyPoint(federation),
	surveyPoint: federation.surveyPoint,
});

export const prepareMockRawSettingsReply = (federation: IFederation): FederationBackendSettings => ({
	...prepareMockSettingsWithoutSurveyPoint(federation),
	surveyPoints: [federation.surveyPoint],
});

export const prepareMockNewFederation = (federation: IFederation): NewFederation => ({
	unit: federation.unit,
	name: federation.name,
	code: federation.code,
	desc: federation.desc,
});

export const federationMockStats = (overrides?: Partial<FederationStats>) => ({
	code: faker.datatype.uuid(),
	desc: faker.random.words(3),
	status: UploadStatuses.OK,
	containers: prepareMockContainers(),
	tickets: {
		issues: faker.datatype.number(),
		risks: faker.datatype.number(),
	},
	category: faker.random.word(),
	lastUpdated: faker.datatype.number(),
	...overrides,
})