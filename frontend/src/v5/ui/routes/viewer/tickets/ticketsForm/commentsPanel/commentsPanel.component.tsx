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
import { formatMessage } from '@/v5/services/intl';
import { useParams } from 'react-router-dom';
import { TicketCommentsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketCommentsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { ScrollArea } from '@controls/scrollArea';
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import {
	enableRealtimeContainerNewTicketComment,
	enableRealtimeContainerUpdateTicketComment,
	enableRealtimeFederationNewTicketComment,
	enableRealtimeFederationUpdateTicketComment,
} from '@/v5/services/realtime/ticketComments.events';
import { FormattedMessage } from 'react-intl';
import { ITicketComment } from '@/v5/store/tickets/comments/ticketComments.types';
import { useEffect, useRef, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { sanitiseMessage, stripMetadata } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { ViewerParams } from '../../../../routes.constants';
import { Accordion, Comments, EmptyCommentsBox } from './commentsPanel.styles';
import { Comment } from './comment/comment.component';
import { CreateCommentBox } from './createCommentBox/createCommentBox.component';

type CommentsPanelProps = {
	scrollPanelIntoView: (event, isExpanding) => void,
};
export const CommentsPanel = ({ scrollPanelIntoView }: CommentsPanelProps) => {
	const [commentReply, setCommentReply] = useState<ITicketComment>(null);
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const comments = TicketCommentsHooksSelectors.selectComments(ticketId);
	const scrollAreaRef = useRef<Scrollbars>();

	const commentsListIsEmpty = comments?.length > 0;

	const getCommentIsFirstOfBlock = (index) => {
		if (index === 0) return true;
		const commentAuthor = comments[index].author;
		return comments[index - 1].author !== commentAuthor;
	};

	const handleDeleteComment = (commentId) => {
		TicketCommentsActionsDispatchers.deleteComment(
			teamspace,
			project,
			containerOrFederation,
			ticketId,
			isFederation,
			commentId,
		);
	};

	const handleReplyToComment = (commentId) => {
		const comment = comments.find(({ _id }) => _id === commentId);
		setCommentReply({
			...comment,
			message: sanitiseMessage(stripMetadata(comment.message)),
		});
	};

	const handleEditComment = (commentId, message, images) => {
		const oldComment = comments.find(({ _id }) => _id === commentId);
		const newHistory = (oldComment.history || []).concat({
			message: oldComment.message,
			images: oldComment.images,
			timestamp: new Date(),
		});
		TicketCommentsActionsDispatchers.updateComment(
			teamspace,
			project,
			containerOrFederation,
			ticketId,
			isFederation,
			commentId,
			{ history: newHistory, message, images },
		);
	};

	useEffect(() => {
		if (!ticketId) return null;
		TicketCommentsActionsDispatchers.fetchComments(
			teamspace,
			project,
			containerOrFederation,
			ticketId,
			isFederation,
		);
		if (isFederation) {
			return combineSubscriptions(
				enableRealtimeFederationNewTicketComment(teamspace, project, containerOrFederation, ticketId),
				enableRealtimeFederationUpdateTicketComment(teamspace, project, containerOrFederation, ticketId),
			);
		}
		return combineSubscriptions(
			enableRealtimeContainerNewTicketComment(teamspace, project, containerOrFederation, ticketId),
			enableRealtimeContainerUpdateTicketComment(teamspace, project, containerOrFederation, ticketId),
		);
	}, [ticketId]);

	useEffect(() => {
		if (!comments.length) return;
		setTimeout(() => scrollAreaRef.current.scrollToBottom(), 100);
	}, [comments.length]);

	return (
		<Accordion
			title={formatMessage({ id: 'customTicket.comments.title', defaultMessage: 'Comments' })}
			Icon={CommentIcon}
			onChange={scrollPanelIntoView}
		>
			<ScrollArea autoHeight autoHeightMin={400} autoHeightMax={400} autoHide ref={scrollAreaRef}>
				{commentsListIsEmpty && (
					<Comments>
						{comments.map((comment, index) => (
							<Comment
								{...comment}
								key={comment._id}
								onDelete={handleDeleteComment}
								onReply={handleReplyToComment}
								onEdit={handleEditComment}
								isFirstOfBlock={getCommentIsFirstOfBlock(index)}
							/>
						))}
					</Comments>
				)}
				{!commentsListIsEmpty && (
					<EmptyCommentsBox>
						<FormattedMessage id="customTicket.comments.empty" defaultMessage="No comments" />
					</EmptyCommentsBox>
				)}
			</ScrollArea>
			<CreateCommentBox
				commentReply={commentReply}
				deleteCommentReply={() => setCommentReply(null)}
			/>
		</Accordion>
	);
};
