/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { Comments, CreateCommentBox, EmptyCommentsBox, FillerRow, CommentsContainer, Table, TableBody, TableRow, VirtualisedList } from './commentsList.styles';
import { FormattedMessage } from 'react-intl';
import { Comment } from '../comment/comment.component';
import { ITicketComment, TicketCommentReplyMetadata } from '@/v5/store/tickets/comments/ticketComments.types';
import { TicketCommentsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketCommentsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useContext, useEffect, useState } from 'react';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { useParams } from 'react-router-dom';
import { Gap } from '@controls/gap/gap.styles';
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import { enableRealtimeFederationNewTicketComment, enableRealtimeFederationUpdateTicketComment, enableRealtimeContainerNewTicketComment, enableRealtimeContainerUpdateTicketComment } from '@/v5/services/realtime/ticketComments.events';
import { sanitiseMessage, stripMetadata } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { TicketContext } from '../../../ticket.context';

export const CommentsList = () => {
	const readOnly = TicketsCardHooksSelectors.selectReadOnly();
	const [commentReply, setCommentReply] = useState<TicketCommentReplyMetadata>(null);
	const { teamspace, project } = useParams<ViewerParams>();
	const { containerOrFederation } = useContext(TicketContext);
	const isFederation = modelIsFederation(containerOrFederation);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const comments = TicketCommentsHooksSelectors.selectComments(ticketId);
	const commentsLength = comments.length;

	const getCommentIsFirstOfBlock = (index) => {
		if (index === 0) return true;
		const comment = comments[index];
		const previousComment = comments[index - 1];
		return (previousComment.originalAuthor || previousComment.author) !== (comment.originalAuthor || comment.author);
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

	useEffect(() => {
		if (!ticketId) return;
		TicketCommentsActionsDispatchers.fetchComments(
			teamspace,
			project,
			containerOrFederation,
			ticketId,
			isFederation,
		);
		if (isFederation) {
			return combineSubscriptions(
				enableRealtimeFederationNewTicketComment(teamspace, project, containerOrFederation),
				enableRealtimeFederationUpdateTicketComment(teamspace, project, containerOrFederation),
			);
		}
		return combineSubscriptions(
			enableRealtimeContainerNewTicketComment(teamspace, project, containerOrFederation),
			enableRealtimeContainerUpdateTicketComment(teamspace, project, containerOrFederation),
		);
	}, [ticketId]);
	return (
		<CommentsContainer>
			<Comments>
				{commentsLength ? (
					<VirtualisedList
						data={comments}
						initialTopMostItemIndex={commentsLength - 1}
						followOutput={() => true}
						overscan={800}
						components={{
							Table,
							// @ts-ignore
							TableBody,
							TableRow,
							FillerRow,
						}}
						itemContent={(index, comment: ITicketComment) => (
							<>
								<Comment
									{...comment}
									key={comment._id}
									onDelete={handleDeleteComment}
									onReply={handleReplyToComment}
									isFirstOfBlock={getCommentIsFirstOfBlock(index)}
								/>
								{index === commentsLength - 1 && (<Gap $height="5px" />)}
							</>
						)}
					/>
				) : (
					<EmptyCommentsBox>
						<EmptyListMessage>
							<FormattedMessage id="customTicket.comments.empty" defaultMessage="No comments" />
						</EmptyListMessage>
					</EmptyCommentsBox>
				)}
			</Comments>
			{!readOnly && <CreateCommentBox commentReply={commentReply} setCommentReply={setCommentReply} />}
		</CommentsContainer>
	);
};
