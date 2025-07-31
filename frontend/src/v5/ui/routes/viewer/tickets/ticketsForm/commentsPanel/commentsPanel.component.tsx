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
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import {
	enableRealtimeContainerNewTicketComment,
	enableRealtimeContainerUpdateTicketComment,
	enableRealtimeFederationNewTicketComment,
	enableRealtimeFederationUpdateTicketComment,
} from '@/v5/services/realtime/ticketComments.events';
import { FormattedMessage } from 'react-intl';
import { ITicketComment, TicketCommentReplyMetadata } from '@/v5/store/tickets/comments/ticketComments.types';
import { useContext, useEffect, useState } from 'react';
import { Gap } from '@controls/gap';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { sanitiseMessage, stripMetadata } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { ViewerParams } from '../../../../routes.constants';
import { Accordion, Comments, CreateCommentBox, EmptyCommentsBox, FillerRow, Table, TableBody, TableRow, VirtualisedList } from './commentsPanel.styles';
import { Comment } from './comment/comment.component';
import { TicketContext } from '../../ticket.context';

type CommentsPanelProps = {
	scrollPanelIntoView: (event, isExpanding) => void,
};
export const CommentsPanel = ({ scrollPanelIntoView }: CommentsPanelProps) => {
	const [commentReply, setCommentReply] = useState<TicketCommentReplyMetadata>(null);
	const { teamspace, project } = useParams<ViewerParams>();
	const { containerOrFederation } = useContext(TicketContext);
	const isFederation = modelIsFederation(containerOrFederation);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const readOnly = TicketsCardHooksSelectors.selectReadOnly();
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
		<Accordion
			title={formatMessage({ id: 'customTicket.comments.title', defaultMessage: 'Comments' })}
			Icon={CommentIcon}
			onChange={scrollPanelIntoView}
		>
			<Comments>
				{commentsLength ? (
					<VirtualisedList
						data={comments}
						initialTopMostItemIndex={commentsLength - 1}
						followOutput={() => true}
						overscan={800}
						components={{
							Table,
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
		</Accordion>
	);
};
