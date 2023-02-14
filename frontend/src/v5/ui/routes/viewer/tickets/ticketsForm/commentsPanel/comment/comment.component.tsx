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

import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';
import { ITicketComment } from '@/v5/store/tickets/comments/ticketComments.types';
import { extractMessage, extractMetadata, getRelativeTime } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { useEffect, useState } from 'react';
import { CurrentUserComment } from './currentUserComment/currentUserComment.component';
import { OtherUserComment } from './otherUserComment/otherUserComment.component';

export type CommentProps = ITicketComment & {
	onDelete: (commentId) => void;
	onReply: (commentId) => void;
	onEdit: (commentId, newMessage, newImages) => void;
};
export const Comment = ({ updatedAt, author, message = '', deleted, _id, images = [], ...props }: CommentProps) => {
	const [commentAge, setCommentAge] = useState('');

	const isCurrentUser = CurrentUserHooksSelectors.selectUsername() === author;
	const metadata = extractMetadata(message);
	const noMetadataMessage = !deleted ? extractMessage(message) : message;

	const updateMessageAge = () => setCommentAge(getRelativeTime(updatedAt));

	useEffect(() => {
		updateMessageAge();
		const intervalId = window.setInterval(updateMessageAge, 10_000);
		return () => clearInterval(intervalId);
	}, [updatedAt]);

	const UserComment = isCurrentUser ? CurrentUserComment : OtherUserComment;
	return (
		<UserComment
			{...props}
			author={author}
			commentAge={commentAge}
			metadata={metadata}
			message={noMetadataMessage}
			deleted={deleted}
			_id={_id}
			images={images}
		/>
	);
};
