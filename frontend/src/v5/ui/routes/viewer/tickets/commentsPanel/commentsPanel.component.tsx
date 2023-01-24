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
import CommentIcon from '@assets/icons/outlined/comment-outlined.svg';
import SendIcon from '@assets/icons/outlined/send_message-outlined.svg';
import FileIcon from '@assets/icons/outlined/file-outlined.svg';
import { formatMessage } from '@/v5/services/intl';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { CurrentUserHooksSelectors, TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { ScrollArea } from '@controls/scrollArea';
import { FormattedMessage } from 'react-intl';
import { IComment, MinimumComment } from '@/v5/store/tickets/tickets.types';
import DeleteIcon from '@assets/icons/outlined/close-outlined.svg';
import { useEffect, useState } from 'react';
import { ViewerParams } from '../../../routes.constants';
import {
	Accordion,
	Comments,
	Controls,
	CharsCounter,
	FileIconButton,
	SendButton,
	BottomSection,
	MessageInput,
	EmptyCommentsBox,
	DeleteButton,
	CommentReplyContainer,
} from './commentsPanel.styles';
import { Comment } from './comment/comment.component';
import { addReply } from './comment/commentMarkDown/commentMarkDown.helpers';
import { MDCommentReply } from './comment/commentMarkDown/markDownElements/markDownComponents.component';
import { CHARS_LIMIT } from './comment/comment.helpers';

export const CommentsPanel = () => {
	const [commentReply, setCommentReply] = useState<IComment>(null);
	const formData = useForm<{ comment: string }>({ mode: 'all' });
	const inputComment = formData.watch('comment');

	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const { comments = [], number } = TicketsHooksSelectors.selectTicketById(containerOrFederation, ticketId);

	const currentUser = CurrentUserHooksSelectors.selectCurrentUser();

	const charsCount = inputComment?.length || 0;
	const charsLimitIsReached = charsCount >= CHARS_LIMIT;
	const commentsListIsEmpty = comments?.length > 0;

	const handleDeleteComment = (commentId) => {
		TicketsActionsDispatchers.deleteTicketComment(
			teamspace,
			project,
			containerOrFederation,
			ticketId,
			isFederation,
			commentId,
		);
	};

	const handleReplyToComment = (commentId) => {
		setCommentReply(comments.find(({ _id }) => _id === commentId));
	};

	const handleEditToComment = (commentId, newComment) => {
		TicketsActionsDispatchers.updateTicketComment(
			teamspace,
			project,
			containerOrFederation,
			ticketId,
			isFederation,
			{ ...newComment, _id: commentId },
		);
	};
	
	const createComment = async () => {
		let comment = inputComment;
		if (commentReply) {
			comment = addReply(commentReply, comment);
		}
		const newComment: MinimumComment = {
			author: currentUser.username,
			comment,
			images: [],
			createdAt: new Date(),
			updatedAt: new Date(),
			deleted: false,
		};
		TicketsActionsDispatchers.createTicketComment(
			teamspace,
			project,
			containerOrFederation,
			ticketId,
			isFederation,
			newComment,
		);
		setCommentReply(null);
		formData.reset();
	};

	useEffect(() => {
		if (!number) return;
		TicketsActionsDispatchers.fetchTicketComments(
			teamspace,
			project,
			containerOrFederation,
			ticketId,
			isFederation,
		)
	}, [number]);

	return (
		<Accordion
			title={formatMessage({ id: 'customTicket.panel.comments', defaultMessage: 'Comments' })}
			Icon={CommentIcon}
		>
			<FormProvider {...formData}>
				<ScrollArea autoHeight autoHeightMin={400} autoHeightMax={400}>
					{commentsListIsEmpty && (
						<Comments>
							{comments.map((comment) => (
								<Comment
									{...comment}
									key={comment._id}
									onDelete={handleDeleteComment}
									onReply={handleReplyToComment}
									onEdit={handleEditToComment}
									commentReply={commentReply}
								/>
							))}
						</Comments>
					)}
					{!commentsListIsEmpty && (
						<EmptyCommentsBox>
							<FormattedMessage id="ticket.comments.empty" defaultMessage='No comments' />
						</EmptyCommentsBox>
					)}
				</ScrollArea>
				<BottomSection>
					{commentReply && (
						<CommentReplyContainer>
							<MDCommentReply {...commentReply} />
							<DeleteButton onClick={() => setCommentReply(null)}>
								<DeleteIcon />
							</DeleteButton>
						</CommentReplyContainer>
					)}
					<MessageInput
						name='comment'
						placeholder={formatMessage({
							id: 'customTicket.panel.comments.leaveAMessage',
							defaultMessage: 'leave a message',
						})}
						inputProps={{ maxlength: 1200 }}
					/>
					{/* <Images /> */}
					<Controls>
						<FileIconButton>
							<FileIcon />
						</FileIconButton>
						<CharsCounter $error={charsLimitIsReached}>{charsCount}/{CHARS_LIMIT}</CharsCounter>
						<SendButton disabled={!charsCount} onClick={createComment}>
							<SendIcon />
						</SendButton>
					</Controls>
				</BottomSection>
			</FormProvider>
		</Accordion>
	);
};
