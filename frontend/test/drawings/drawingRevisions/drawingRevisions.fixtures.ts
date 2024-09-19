/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { CreateDrawingRevisionBody, IDrawingRevision } from '@/v5/store/drawings/revisions/drawingRevisions.types';

export const drawingRevisionsMockFactory = (overrides?: Partial<IDrawingRevision>): IDrawingRevision => ({
	_id: faker.datatype.uuid(),
	timestamp: faker.date.past(2),
	author: faker.name.findName(),
	desc: faker.random.words(3),
	void: faker.datatype.boolean(),
	format: faker.system.commonFileExt(),
	name: faker.random.word(),
	revCode: faker.random.word(),
	statusCode: faker.random.word(),
	...overrides,
});

export const mockCreateRevisionBody = (overrides?: Partial<CreateDrawingRevisionBody>): CreateDrawingRevisionBody => ({
	file: new File(['file'], 'filename.dwg'),
	drawingId: faker.datatype.uuid(),
	drawingName: faker.random.words(1),
	drawingType: 'Other',
	drawingDesc: faker.random.words(3),
	drawingNumber: faker.random.word(),
	description: faker.random.word(),
	name: faker.random.word(),
	revCode: faker.random.word(),
	statusCode: faker.random.word(),
	...overrides,
});
