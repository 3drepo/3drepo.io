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

import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { CurrentUserHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { IComment } from '@/v5/store/tickets/tickets.types';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { extractMessage, extractMetadata, getRelativeTime } from './comment.helpers';
import { CurrentUserComment } from './currentUserComment/currentUserComment.component';
import { OtherUserComment } from './otherUserComment/otherUserComment.component';

export type CommentProps = IComment & {
	onDelete: (commentId) => void;
	onReply: (commentId) => void;
	onEdit: (commentId, newMessage: string) => void;
};
export const Comment = ({ createdAt, author, message, deleted, _id, ...props }: CommentProps) => {
	const [commentAge, setCommentAge] = useState(getRelativeTime(createdAt));
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();

	const isCurrentUser = CurrentUserHooksSelectors.selectUsername() === author;
	const metadata = extractMetadata(message);
	const noMetadataMessage = !deleted ? extractMessage(message) : message;

	const UserComment = isCurrentUser ? CurrentUserComment : OtherUserComment;

	useEffect(() => {
		TicketsActionsDispatchers.fetchTicketCommentWithHistory(
			teamspace,
			project,
			containerOrFederation,
			ticketId,
			isFederation,
			_id,
		);
		const intervalId = window.setInterval(() => setCommentAge(getRelativeTime(createdAt)), 10_000);
		return () => clearInterval(intervalId);
	}, []);

	return (
		<UserComment
			{...props}
			author={author}
			commentAge={commentAge}
			metadata={metadata}
			message={noMetadataMessage}
			deleted={deleted}
			_id={_id}
		/>
	);
};
