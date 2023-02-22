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
import SendIcon from '@assets/icons/outlined/send_message-outlined.svg';
import FileIcon from '@assets/icons/outlined/file-outlined.svg';
import { formatMessage } from '@/v5/services/intl';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { CurrentUserHooksSelectors, TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import DeleteIcon from '@assets/icons/outlined/close-outlined.svg';
import { useEffect, useState } from 'react';
import {
	Controls,
	CharsCounter,
	FileIconButton,
	SendButton,
	Container,
	MessageInput,
	DeleteButton,
	CommentReplyContainer,
} from './createCommentBox.styles';
import { addReply, createMetadata, MAX_MESSAGE_LENGTH, sanitiseMessage } from '../comment/comment.helpers';
import { CommentReply } from '../comment/commentReply/commentReply.component';

export const CreateCommentBox = ({ commentReply, setCommentReply }) => {
	const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
	const { watch, reset, control } = useForm<{ message: string }>({ mode: 'all' });
	const messageInput = watch('message');

	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const { number } = TicketsHooksSelectors.selectTicketById(containerOrFederation, ticketId);

	const currentUser = CurrentUserHooksSelectors.selectCurrentUser();

	const commentReplyLength = commentReply ? addReply(createMetadata(commentReply), '').length : 0;
	const charsCount = (messageInput?.length || 0) + commentReplyLength;
	const charsLimitIsReached = charsCount >= MAX_MESSAGE_LENGTH;

	const resetCommentBox = () => {
		reset();
		setCommentReply(null);
		setIsSubmittingMessage(false);
	};

	const createComment = async () => {
		setIsSubmittingMessage(true);
		let message = sanitiseMessage(messageInput);
		if (commentReply) {
			message = addReply(createMetadata(commentReply), message);
		}
		const newComment = {
			author: currentUser.username,
			message,
		};
		TicketsActionsDispatchers.createTicketComment(
			teamspace,
			project,
			containerOrFederation,
			ticketId,
			isFederation,
			newComment,
			resetCommentBox,
			() => setIsSubmittingMessage(false),
		);
	};

	useEffect(() => {
		if (number) resetCommentBox();
	}, [number]);

	return (
		<Container>
			{commentReply && (
				<CommentReplyContainer>
					<CommentReply {...createMetadata(commentReply)} shortMessage />
					<DeleteButton onClick={() => setCommentReply(null)}>
						<DeleteIcon />
					</DeleteButton>
				</CommentReplyContainer>
			)}
			<MessageInput
				name="message"
				placeholder={formatMessage({
					id: 'customTicket.panel.comments.leaveAComment',
					defaultMessage: 'Leave a comment',
				})}
				control={control}
				inputProps={{
					maxLength: Math.max(MAX_MESSAGE_LENGTH - commentReplyLength, 0),
				}}
			/>
			<Controls>
				<FileIconButton>
					<FileIcon />
				</FileIconButton>
				<CharsCounter $error={charsLimitIsReached}>{charsCount}/{MAX_MESSAGE_LENGTH}</CharsCounter>
				<SendButton
					disabled={!messageInput?.trim()?.length || charsLimitIsReached}
					onClick={createComment}
					isPending={isSubmittingMessage}
				>
					<SendIcon />
				</SendButton>
			</Controls>
		</Container>
	);
};
