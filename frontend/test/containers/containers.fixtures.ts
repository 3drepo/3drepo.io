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
import { UploadStatus, IContainer, ContainerStats } from '@/v5/store/containers/containers.types';
import { EMPTY_VIEW } from './../../src/v5/store/store.helpers';
import { ContainerSettings } from '@/v5/store/containers/containers.types';
import { ContainerBackendSettings } from '@/v5/store/containers/containers.types';
import { View } from '@/v5/store/store.types';
import { Role } from '@/v5/store/currentUser/currentUser.types';
import { omit } from 'lodash';

export const containerMockFactory = (overrides?: Partial<IContainer>): IContainer => ({
	_id: faker.datatype.uuid(),
	latestRevision: faker.random.words(2),
	revisionsCount: faker.datatype.number({ min: 10, max: 1200 }),
	lastUpdated: faker.date.past(2),
	name: faker.random.words(3),
	desc: faker.random.words(3),
	role: faker.random.arrayElement([Role.ADMIN, Role.COLLABORATOR]),
	type: faker.random.word(),
	status: UploadStatus.OK,
	code: faker.datatype.uuid(),
	isFavourite: faker.datatype.boolean(),
	hasStatsPending: true,
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

export const prepareMockBaseContainer = (container: IContainer) => omit(container, ['views', 'defaultView', 'surveyPoint', 'angleFromNorth'])

export const prepareMockStats = (overrides?: Partial<ContainerStats>): ContainerStats => ({
	revisions: {
		total: faker.datatype.number(),
		lastUpdated: faker.datatype.number(),
		latestRevision: faker.random.word(),
	},
	type: faker.random.word(),
	status: UploadStatus.OK,
	unit: faker.random.arrayElement(['mm', 'cm', 'dm', 'm', 'ft']),
	code: faker.datatype.uuid(),
	...overrides,
});

export const getMockStats = (container: IContainer): ContainerStats => ({
	revisions: {
		total: container.revisionsCount,
		lastUpdated: container.lastUpdated.valueOf(),
		latestRevision: container.latestRevision
	},
	type: container.type,
	status: container.status,
	code: container.code,
	unit: container.unit
});

export const prepareMockViews = (): View[] => {
	const views = [];
	for(let i = 0; i < 3; i++) {
		views.push({
			_id: faker.datatype.uuid(),
			hasThumbnail: faker.datatype.boolean(),
			name: faker.random.word(),
		});
	}
	return views;
};

const prepareMockSettingsWithoutSurveyPoint = (container: IContainer): Omit<ContainerSettings, 'surveyPoint'> => ({
	angleFromNorth: container.angleFromNorth,
	defaultView: container.defaultView,
	unit: container.unit,
	name: container.name,
	code: container.code,
	desc: container.desc,
	type: container.type,
});

export const prepareMockSettingsReply = (container: IContainer): ContainerSettings => ({
	...prepareMockSettingsWithoutSurveyPoint(container),
	surveyPoint: container.surveyPoint,
});

export const prepareMockRawSettingsReply = (container: IContainer): ContainerBackendSettings => ({
	...prepareMockSettingsWithoutSurveyPoint(container),
	surveyPoints: [container.surveyPoint],
});
