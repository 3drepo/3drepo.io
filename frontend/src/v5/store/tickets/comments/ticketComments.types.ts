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

import { Viewpoint } from '../tickets.types';

export type TicketCommentHistoryBlock = {
	message: string,
	images: string[],
	timestamp: Date,
	view: Viewpoint,
};

export type ITicketComment = {
	_id: string,
	message?: string,
	images?: string[],
	view?: Viewpoint,
	author: string,
	createdAt: Date,
	updatedAt: Date,
	deleted: boolean,
	history?: TicketCommentHistoryBlock[],
	// imported tickets
	originalAuthor?: string,
	importedAt?: Date,
};

export type TicketCommentReplyMetadata = Pick<ITicketComment, '_id' | 'message' | 'author' | 'originalAuthor' | 'images'  | 'view'>;
