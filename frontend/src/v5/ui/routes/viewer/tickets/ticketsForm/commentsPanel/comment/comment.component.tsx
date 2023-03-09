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
import { stripMetadata, extractMetadata, getRelativeTime } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { Gap } from '@controls/gap';
import { memo, useEffect, useState } from 'react';
import { CurrentUserComment } from './currentUserComment/currentUserComment.component';
import { OtherUserComment } from './otherUserComment/otherUserComment.component';

export type CommentProps = ITicketComment & {
	onDelete: (commentId) => void;
	onReply: (commentId) => void;
	onEdit: (commentId, newMessage, newImages) => void;
	isFirstOfBlock: boolean;
};
export const Comment = memo(({
	isFirstOfBlock,
	onDelete,
	onReply,
	onEdit,
	...comment
}: CommentProps) => {
	const {
		updatedAt,
		author,
		message = '',
		deleted,
		createdAt,
	} = comment;
	const [commentAge, setCommentAge] = useState('');

	const isCurrentUser = CurrentUserHooksSelectors.selectUsername() === author;
	const metadata = extractMetadata(message);
	const noMetadataMessage = !deleted ? stripMetadata(message) : message;

	const updateMessageAge = () => setCommentAge(getRelativeTime(updatedAt || createdAt));

	useEffect(() => {
		updateMessageAge();
		const intervalId = window.setInterval(updateMessageAge, 10_000);
		return () => clearInterval(intervalId);
	}, [updatedAt]);

	const UserComment = isCurrentUser ? CurrentUserComment : OtherUserComment;
	return (
		<>
			<Gap $height={isFirstOfBlock ? '12px' : '4px'} />
			<UserComment
				{...comment}
				onDelete={() => onDelete(comment)}
				onReply={() => onReply(comment)}
				onEdit={(newMessage, newImages) => onEdit(comment, newMessage, newImages)}
				commentAge={commentAge}
				metadata={metadata}
				message={noMetadataMessage}
				isFirstOfBlock={isFirstOfBlock}
			/>
		</>
	);
});
