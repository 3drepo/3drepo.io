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

import { useState } from 'react';
import ReplyIcon from '@assets/icons/outlined/reply_arrow-outlined.svg';
import EditIcon from '@assets/icons/outlined/edit_comment-outlined.svg';
import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import { CommentReplyMetadata, IComment } from '@/v5/store/tickets/tickets.types';
import { ErrorCommentButton, PrimaryCommentButton } from '../commentButton/commentButton.styles';
import { CommentReply } from '../commentReply/commentReply.component';
import { CommentMarkDown } from '../commentMarkDown/commentMarkDown';
import { editedCommentMessage } from '../comment.helpers';
import { CommentContainer } from './currentUserComment.styles';
import { CommentAge, CommentButtons, EditedCommentLabel } from '../basicCommentWithImages/basicCommentWithImages.styles';
import { EditComment } from './editComment/editComment.component';
import { DeletedComment } from './deletedComment/deletedComment.component';

export type CurrentUserCommentProps = Omit<IComment, 'updatedAt'> & {
	commentAge: string;
	metadata?: CommentReplyMetadata;
	onDelete: (commentId) => void;
	onReply: (commentId) => void;
	onEdit: (commentId, newMessage: string) => void;
};
export const CurrentUserComment = ({
	_id,
	author,
	deleted,
	message,
	commentAge,
	metadata,
	history,
	onDelete,
	onReply,
	onEdit,
}: CurrentUserCommentProps) => {
	const [isEditMode, setIsEditMode] = useState(false);

	if (deleted) return (<DeletedComment author={author} />);

	if (isEditMode) {
		return (
			<EditComment
				_id={_id}
				message={message}
				author={author}
				metadata={metadata}
				onEdit={onEdit}
				onClose={() => setIsEditMode(false)}
			/>
		);
	}

	return (
		<CommentContainer data-author={author}>
			<CommentButtons>
				<ErrorCommentButton onClick={() => onDelete(_id)}>
					<DeleteIcon />
				</ErrorCommentButton>
				<PrimaryCommentButton onClick={() => onReply(_id)}>
					<ReplyIcon />
				</PrimaryCommentButton>
				<PrimaryCommentButton onClick={() => setIsEditMode(true)}>
					<EditIcon />
				</PrimaryCommentButton>
			</CommentButtons>
			{metadata.message && (<CommentReply variant="secondary" {...metadata} />)}
			{history && <EditedCommentLabel>{editedCommentMessage}</EditedCommentLabel>}
			<CommentMarkDown>{message}</CommentMarkDown>
			<CommentAge>{commentAge}</CommentAge>
		</CommentContainer>
	);
};
