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
import { EMPTY_VIEW, FetchFederationStatsResponse, IFederation } from '@/v5/store/federations/federations.types';
import { times } from 'lodash';

export const federationMockFactory = (overrides?: Partial<IFederation>): IFederation => ({
	_id: faker.datatype.uuid(),
	name: faker.random.words(3),
	role: faker.random.arrayElement(['admin', 'collaborator']),
	lastUpdated: faker.date.past(2),
	status: UploadStatuses.OK,
	code: faker.datatype.uuid(),
	category: faker.random.words(2),
	containers: faker.datatype.number(120),
	subModels: times(faker.datatype.number({ max: 10, min: 1 }), () => faker.datatype.uuid()),
	isFavourite: faker.datatype.boolean(),
	issues: faker.datatype.number(120),
	risks: faker.datatype.number(120),
	hasStatsPending: false,
	settings: {
		angleFromNorth: faker.datatype.number(90),
		defaultView: faker.random.arrayElement([EMPTY_VIEW]),
		surveyPoint: {
			latLong: [faker.datatype.number(0), faker.datatype.number(0)],
			position: [faker.datatype.number(0), faker.datatype.number(0), faker.datatype.number(0)],
		},
		unit: faker.random.arrayElement(['mm', 'cm', 'dm', 'm', 'ft']),
	},
	views: [EMPTY_VIEW],
	...overrides,
});

export const prepareMockStatsReply = (federation: IFederation): FetchFederationStatsResponse => ({
	subModels: federation.subModels,
	tickets: {
		issues: federation.issues,
		risks: federation.risks,
	},
	lastUpdated: federation.lastUpdated.valueOf(),
	category: federation.category,
	status: federation.status,
	code: federation.code,
});
