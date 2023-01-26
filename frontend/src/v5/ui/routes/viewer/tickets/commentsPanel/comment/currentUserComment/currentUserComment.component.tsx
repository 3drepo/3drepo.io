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
import TickIcon from '@assets/icons/outlined/tick-outlined.svg';
import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import CancelIcon from '@assets/icons/outlined/cross_sharp_edges-outlined.svg';
import { formatMessage } from '@/v5/services/intl';
import { CommentReplyMetadata, IComment } from '@/v5/store/tickets/tickets.types';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { ErrorCommentButton, PrimaryCommentButton } from '../commentButton/commentButton.styles';
import { stringifyComment, parseComment, addReply } from '../commentMarkDown/commentMarkDown.helpers';
import { CommentReply } from '../commentReply/commentReply.component';
import { CommentMarkDown } from '../commentMarkDown/commentMarkDown';
import { deletedCommentText } from '../comment.helpers';
import { CommentTime, CommentButtons } from '../comment.styles';
import { CommentContainer, EditCommentButtons, EditCommentContainer, EditCommentInput } from './currentUserComment.styles';

type CurrentUserCommentProps = Omit<IComment, 'createdAt'> & {
	commentAge: string;
	metadata?: CommentReplyMetadata;
	onDelete: (commentId) => void;
	onReply: (commentId) => void;
	onEdit: (commentId, newComment: string) => void;
};
export const CurrentUserComment = ({
	_id,
	author,
	deleted,
	comment,
	commentAge,
	metadata,
	onDelete,
	onReply,
	onEdit,
}: CurrentUserCommentProps) => {
	const [isEditMode, setIsEditMode] = useState(false);
	const { control, watch } = useForm<{ editComment }>({
		defaultValues: { editComment: stringifyComment(comment) },
	});

	if (deleted) {
		return (
			<CommentContainer $deleted data-author={author}>
				<CommentMarkDown>{deletedCommentText}</CommentMarkDown>
				<CommentTime>
					<FormattedMessage
						id="ticket.currentUser.comment.time.delete"
						defaultMessage="You deleted this message"
					/>
				</CommentTime>
			</CommentContainer>
		);
	}

	if (isEditMode) {
		const updateMessage = () => {
			const newComment = parseComment(watch('editComment'));
			const updatedComment = addReply(metadata, newComment);
			onEdit(_id, updatedComment);
			setIsEditMode(false);
		};

		return (
			<>
				<EditCommentContainer data-author={author}>
					{metadata.comment && (<CommentReply {...metadata} />)}
					<EditCommentInput
						name="editComment"
						placeholder={formatMessage({
							id: 'customTicket.panel.comments.edit',
							defaultMessage: ' ',
						})}
						control={control}
					/>
				</EditCommentContainer>
				<EditCommentButtons>
					<ErrorCommentButton onClick={() => setIsEditMode(false)}>
						<CancelIcon />
					</ErrorCommentButton>
					<PrimaryCommentButton onClick={updateMessage} disabled={!watch('editComment').length}>
						<TickIcon />
					</PrimaryCommentButton>
				</EditCommentButtons>
			</>
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
			{metadata.comment && (<CommentReply variant="secondary" {...metadata} />)}
			<CommentMarkDown>{comment}</CommentMarkDown>
			<CommentTime>{commentAge}</CommentTime>
		</CommentContainer>
	);
};
