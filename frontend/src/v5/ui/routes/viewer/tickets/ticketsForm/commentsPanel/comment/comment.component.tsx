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
import { stripMetadata, extractMetadata } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { Gap } from '@controls/gap';
import { CurrentUserComment } from './currentUserComment/currentUserComment.component';
import { OtherUserComment } from './otherUserComment/otherUserComment.component';

export type CommentProps = ITicketComment & {
	onDelete: (commentId) => void;
	onReply: (commentId) => void;
	isFirstOfBlock: boolean;
};
export const Comment = ({
	updatedAt,
	createdAt,
	author,
	originalAuthor,
	message = '',
	deleted,
	_id,
	images = [],
	isFirstOfBlock,
	...props
}: CommentProps) => {
	const isCurrentUser = !!originalAuthor ? false : CurrentUserHooksSelectors.selectUsername() === author;
	const metadata = extractMetadata(message);
	const noMetadataMessage = !deleted ? stripMetadata(message) : message;

	const UserComment = isCurrentUser ? CurrentUserComment : OtherUserComment;
	return (
		<>
			<Gap $height={isFirstOfBlock ? '12px' : '4px'} />
			<UserComment
				{...props}
				updatedAt={updatedAt}
				createdAt={createdAt}
				author={author}
				originalAuthor={originalAuthor}
				metadata={metadata}
				message={noMetadataMessage}
				deleted={deleted}
				_id={_id}
				images={images}
				isFirstOfBlock={isFirstOfBlock}
			/>
		</>
	);
};
