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
import { TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
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
import { IComment } from '@/v5/store/tickets/tickets.types';
import { useEffect, useState } from 'react';
import { ViewerParams } from '../../../routes.constants';
import { Accordion, Comments, EmptyCommentsBox } from './commentsPanel.styles';
import { Comment } from './comment/comment.component';
import { CreateCommentBox } from './createCommentBox/createCommentBox.component';

export const CommentsPanel = ({ scrollPanelIntoView }) => {
	const [commentReply, setCommentReply] = useState<IComment>(null);
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const { comments = [], number } = TicketsHooksSelectors.selectTicketById(containerOrFederation, ticketId);

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
		const comment = comments.find(({ _id }) => _id === commentId);
		setCommentReply(comment);
	};

	const handleEditComment = (commentId, message: string) => {
		const oldComment = comments.find(({ _id }) => _id === commentId);
		const newHistory = (oldComment.history || []).concat({
			message: oldComment.message,
			images: oldComment.images,
			timestamp: new Date(),
		});
		TicketsActionsDispatchers.updateTicketComment(
			teamspace,
			project,
			containerOrFederation,
			ticketId,
			isFederation,
			commentId,
			{ history: newHistory, message },
		);
	};

	useEffect(() => {
		if (!number) return null;
		TicketsActionsDispatchers.fetchTicketComments(
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
	}, [number]);

	return (
		<Accordion
			title={formatMessage({ id: 'customTicket.panel.comments', defaultMessage: 'Comments' })}
			Icon={CommentIcon}
			onChange={scrollPanelIntoView}
		>
			<ScrollArea autoHeight autoHeightMin={400} autoHeightMax={400}>
				{commentsListIsEmpty && (
					<Comments>
						{comments.map((comment) => (
							<Comment
								{...comment}
								key={comment._id}
								onDelete={handleDeleteComment}
								onReply={handleReplyToComment}
								onEdit={handleEditComment}
							/>
						))}
					</Comments>
				)}
				{!commentsListIsEmpty && (
					<EmptyCommentsBox>
						<FormattedMessage id="ticket.comments.empty" defaultMessage="No comments" />
					</EmptyCommentsBox>
				)}
			</ScrollArea>
			<CreateCommentBox
				commentReply={commentReply}
				setCommentReply={setCommentReply}
			/>
		</Accordion>
	);
};
