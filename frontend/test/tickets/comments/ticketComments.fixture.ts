/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { TicketCommentHistoryBlock, ITicketComment } from '@/v5/store/tickets/comments/ticketComments.types';
import * as faker from 'faker';
import { times } from 'lodash';

export const commentHistoryMockFactory = (overrides?: Partial<TicketCommentHistoryBlock>): TicketCommentHistoryBlock => ({
	images: [faker.random.word()],
	message: faker.random.word(),
	timestamp: faker.datatype.datetime(),
	...overrides,
});

export const commentMockFactory = (overrides?: Partial<ITicketComment>): ITicketComment => ({
	_id: faker.datatype.uuid(),
	message: faker.random.word(),
	images: [faker.random.word()],
	author: faker.random.word(),
	createdAt: faker.datatype.datetime().getTime(),
	updatedAt: faker.datatype.datetime().getTime(),
	deleted: faker.datatype.boolean(),
	...overrides,
}) as ITicketComment;

export const mockRiskCategories = (): string[] => times(5, () => faker.random.word());
