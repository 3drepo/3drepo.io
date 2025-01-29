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
import { UploadStatus } from '@/v5/store/containers/containers.types';
import {
	FederationBackendSettings,
	FederationSettings,
	FederationStats,
	GroupedContainer,
	IFederation,
	NewFederation,
} from '@/v5/store/federations/federations.types';
import { EMPTY_VIEW } from '@/v5/store/store.helpers';
import { Role } from '@/v5/store/currentUser/currentUser.types';
import { times } from 'lodash';

export const prepareMockContainers = (min = 1, max = 10): string[] => (
	times(faker.datatype.number({ max, min }), () => faker.datatype.uuid()) 
);

export const groupedContainerMockFactory = (overrides?: GroupedContainer): GroupedContainer => ({
	_id: faker.datatype.uuid(),
	group: faker.random.word(),
	...overrides
});

export const prepareMockBaseFederation = ({_id, name, role, isFavourite}: IFederation): Partial<IFederation> => ({_id, name, role, isFavourite});

export const federationMockFactory = (overrides?: Partial<IFederation>): IFederation => ({
	_id: faker.datatype.uuid(),
	name: faker.random.words(3),
	desc: faker.random.words(3),
	role: faker.random.arrayElement([Role.ADMIN, Role.COLLABORATOR]),
	lastUpdated: faker.date.past(2),
	status: UploadStatus.OK,
	code: faker.datatype.uuid(),
	category: faker.random.words(2),
	containers: [groupedContainerMockFactory()],
	isFavourite: faker.datatype.boolean(),
	tickets: faker.datatype.number(120),
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
	jobs: [
		{ _id: faker.random.word(), isViewer: true },
		{ _id: faker.random.word(), isViewer: false },
	],
	users: [
		{ user: faker.random.word(), isViewer: true },
		{ user: faker.random.word(), isViewer: false },
	],
	...overrides,
});

export const prepareMockStats = (overrides?: Partial<IFederation>) => ({
	code: faker.datatype.uuid(),
	desc: faker.random.words(3),
	status: UploadStatus.OK,
	containers: [groupedContainerMockFactory()],
	tickets: {
		issues: faker.datatype.number(),
		risks: faker.datatype.number(),
	},
	category: faker.random.word(),
	lastUpdated: faker.datatype.number(),
	...overrides,
}) as unknown as FederationStats;

export const prepareMockNewFederation = (federation: IFederation): NewFederation => ({
	unit: federation.unit,
	name: federation.name,
	code: federation.code,
	desc: federation.desc,
});

const prepareMockSettingsWithoutSurveyPoint = (federation: IFederation): Omit<FederationSettings, 'surveyPoint'> => ({
	angleFromNorth: federation.angleFromNorth,
	defaultView: federation.defaultView,
	...prepareMockNewFederation(federation),
});

export const prepareMockSettingsReply = (federation: IFederation): FederationSettings => ({
	...prepareMockSettingsWithoutSurveyPoint(federation),
	surveyPoint: federation.surveyPoint,
});

export const prepareMockRawSettingsReply = (federation: IFederation): FederationBackendSettings => ({
	...prepareMockSettingsWithoutSurveyPoint(federation),
	surveyPoints: [federation.surveyPoint],
});
