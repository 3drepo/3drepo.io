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
import { TicketCommentReplyMetadata, ITicketComment } from '@/v5/store/tickets/comments/ticketComments.types';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketButton } from '../../../../ticketButton/ticketButton.styles';
import { Comment, CommentWithButtonsContainer, EditComment } from './currentUserComment.styles';
import { DeletedComment } from './deletedComment/deletedComment.component';
import { CommentButtons } from '../basicComment/basicComment.styles';
import { desanitiseMessage } from '@/v5/store/tickets/comments/ticketComments.helpers';


export type CurrentUserCommentProps = ITicketComment & {
	commentAge: string;
	metadata?: TicketCommentReplyMetadata;
	isFirstOfBlock: boolean;
	onDelete: (commentId) => void;
	onReply: (commentId) => void;
};
export const CurrentUserComment = ({
	_id,
	author,
	deleted,
	message,
	metadata,
	images,
	view,
	onDelete,
	onReply,
	...props
}: CurrentUserCommentProps) => {
	const [isEditMode, setIsEditMode] = useState(false);
	const readOnly = TicketsCardHooksSelectors.selectReadOnly();
	const [commentReply, setCommentReply] = useState(metadata);

	if (deleted) return (<DeletedComment author={author} />);

	if (isEditMode) {
		return (
			<EditComment
				commentId={_id}
				message={desanitiseMessage(message)}
				images={images}
				commentReply={commentReply}
				setCommentReply={setCommentReply}
				view={view}
				onCancelEdit={() => {
					setIsEditMode(false);
					setCommentReply(metadata);
				}}
			/>
		);
	}

	return (
		<CommentWithButtonsContainer>
			{!readOnly && (
				<CommentButtons>
					<TicketButton variant="error" onClick={() => onDelete(_id)}>
						<DeleteIcon />
					</TicketButton>
					<TicketButton variant="primary" onClick={() => onReply(_id)}>
						<ReplyIcon />
					</TicketButton>
					<TicketButton variant="primary" onClick={() => setIsEditMode(true)}>
						<EditIcon />
					</TicketButton>
				</CommentButtons>
			)}
			<Comment
				commentId={_id}
				message={message}
				images={images}
				metadata={metadata}
				view={view}
				{...props}
			/>
		</CommentWithButtonsContainer>
	);
};
