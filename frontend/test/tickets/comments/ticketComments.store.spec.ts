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
import { TicketCommentsActions } from '@/v5/store/tickets/comments/ticketComments.redux';
import { selectComments, selectCommentById } from '@/v5/store/tickets/comments/ticketComments.selectors';
import { createTestStore } from '../../test.helpers';
import { commentMockFactory } from './ticketComments.fixture';

describe('Tickets: store', () => {
	let dispatch, getState;
	const ticketId = 'ticketId';
	const comment = commentMockFactory();
	const commentId = comment._id;

	beforeEach(() => {
		({ dispatch, getState } = createTestStore());
	});

	describe('comments', () => {
		it('should fetch and set comments', () => {
			dispatch(TicketCommentsActions.fetchCommentsSuccess(ticketId, [comment]));
			const commentFromStore = selectCommentById(getState(), ticketId, commentId);
	
			expect(commentFromStore).toEqual(comment);
		});
	
		it('should update the comments', () => {
			dispatch(TicketCommentsActions.fetchCommentsSuccess(ticketId, [comment]));
	
			const updatedComment = commentMockFactory({ ...comment, message: 'modified message' });	
			dispatch(TicketCommentsActions.upsertCommentSuccess(ticketId, updatedComment));
			const commentFromStore = selectCommentById(getState(), ticketId, commentId);
	
			expect(commentFromStore).toEqual(updatedComment);
		});
	
		it('should insert a comment', () => {
			dispatch(TicketCommentsActions.upsertCommentSuccess(ticketId, comment));

			const commentsFromStore = selectComments(getState(), ticketId, commentId);
			expect(commentsFromStore.length).toEqual(1);
			expect(commentsFromStore[0]).toEqual(comment);
		});
	
		it('should delete a comment', () => {
			const nonDeletedComment = commentMockFactory({ deleted: false });
			dispatch(TicketCommentsActions.fetchCommentsSuccess(ticketId, [nonDeletedComment]));
	
			dispatch(TicketCommentsActions.upsertCommentSuccess(ticketId, { _id: commentId, deleted: true }));
			const commentFromStore = selectCommentById(getState(), ticketId, commentId);
	
			expect(commentFromStore.deleted).toEqual(true);
		});
	});
});
