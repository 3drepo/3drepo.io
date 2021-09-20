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

import { IContainer } from '@/v5/store/containers/containers.types';

export const mockContainers: IContainer[] = [
	{
		_id: '1121523',
		latestRevision: 123,
		title: 'Some different container title',
		revisionsCount: 2521,
		category: 'Mocks',
		code: 'ABC11212312123-12312',
		date: new Date('1993-12-17T03:24:00'),
	},
	{
		_id: '123123',
		latestRevision: 123,
		title: 'Some container title',
		revisionsCount: 89,
		category: 'Architecture',
		code: 'DD-SSS_Z123123SSSss',
		date: new Date('2021-08-17T03:24:00'),
	},
];

for (let i = 0; i < 10; i++) {
	const mockContainer = {
		_id: String(i),
		latestRevision: 123,
		title: String(i),
		revisionsCount: 120,
		category: 'my awesome category',
		code: 'XX123',
		date: new Date(),
	};

	mockContainers.push(mockContainer);
}
