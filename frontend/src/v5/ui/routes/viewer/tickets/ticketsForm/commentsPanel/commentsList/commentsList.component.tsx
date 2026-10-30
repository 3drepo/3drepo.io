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
import { Comments, CreateCommentBox, EmptyCommentsBox, CommentsContainer, TableRow, CommentsVirtualList } from './commentsList.styles';
import { FormattedMessage } from 'react-intl';
import { Comment } from '../comment/comment.component';
import { ITicketComment, TicketCommentReplyMetadata } from '@/v5/store/tickets/comments/ticketComments.types';
import { TicketCommentsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketCommentsActionsDispatchers, TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useContext, useEffect, useRef, useState } from 'react';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { useParams } from 'react-router-dom';
import { Gap } from '@controls/gap/gap.styles';
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import { enableRealtimeFederationNewTicketComment, enableRealtimeFederationUpdateTicketComment, enableRealtimeContainerNewTicketComment, enableRealtimeContainerUpdateTicketComment } from '@/v5/services/realtime/ticketComments.events';
import { sanitiseMessage, stripMetadata } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { TicketContext } from '../../../ticket.context';
import { VListHandle } from '@controls/virtualList/virtualList.component';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';

export const CommentsList = () => {
	const readOnly = TicketsCardHooksSelectors.selectReadOnly();
	const [commentReply, setCommentReply] = useState<TicketCommentReplyMetadata>(null);
	const { teamspace, project } = useParams<ViewerParams>();
	const { containerOrFederation } = useContext(TicketContext);
	const isFederation = modelIsFederation(containerOrFederation);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const comments = TicketCommentsHooksSelectors.selectComments(ticketId);
	const [commentToShow, setCommentToShow] = useSearchParam('commentId');
	const commentsLength = comments.length;
	const isExpanded = TicketsCardHooksSelectors.selectIsExpandedTicketView();

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

	const tableHandle = useRef<VListHandle>(null);

	useEffect(() => {
		if (!comments || comments.length === 0 || !tableHandle.current || commentToShow == null) return;
		if (!isExpanded) {
			TicketsCardActionsDispatchers.setIsExpandedTicketView(true);
			return;
		}

		const index = comments.findIndex(({ _id }) => _id === commentToShow);
		if (index !== -1) {
			tableHandle.current?.gotoIndex(index, undefined, true);
			setCommentToShow();
		}
	}, [commentToShow, comments, tableHandle.current, isExpanded]);
	
	return (
		<CommentsContainer>
			<Comments>
				{commentsLength === 0 && (
					<EmptyCommentsBox>
						<EmptyListMessage>
							<FormattedMessage id="customTicket.comments.empty" defaultMessage="No comments" />
						</EmptyListMessage>
					</EmptyCommentsBox>
				)}
				{commentsLength > 0 && (
					<CommentsVirtualList handle={tableHandle} items={comments} itemHeight={80} ItemComponent={
						(comment: ITicketComment, index) => (
							<TableRow key={comment._id}>
								<Comment
									{...comment}
									onDelete={handleDeleteComment}
									onReply={handleReplyToComment}
									isFirstOfBlock={getCommentIsFirstOfBlock(index)}
								/>
								{index === commentsLength - 1 && (<Gap $height="5px" />)}
							</TableRow>
						)
					} />
				)}
			</Comments>
			{!readOnly && <CreateCommentBox commentReply={commentReply} setCommentReply={setCommentReply} />}
		</CommentsContainer>
	);
};
