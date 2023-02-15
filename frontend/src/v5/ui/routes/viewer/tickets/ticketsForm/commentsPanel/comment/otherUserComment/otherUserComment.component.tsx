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

import { TeamspacesHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import ReplyIcon from '@assets/icons/outlined/reply_arrow-outlined.svg';
import { TicketCommentReplyMetadata, ITicketComment } from '@/v5/store/tickets/comments/ticketComments.types';
import { PrimaryCommentButton } from '../commentButton/commentButton.styles';
import { CommentButtons } from '../basicComment/basicComment.styles';
import { Comment, UserCirclePopover } from './otherUserComment.styles';
import { DeletedComment } from './deletedComment/deletedComment.component';

type OtherUserCommentProps = Omit<ITicketComment, 'updatedAt'> & {
	commentAge: string;
	metadata?: TicketCommentReplyMetadata;
	onReply: (commentId) => void;
};
export const OtherUserComment = ({
	_id,
	deleted,
	author,
	onReply,
	...props
}: OtherUserCommentProps) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const user = UsersHooksSelectors.selectUser(teamspace, author);
	const authorDisplayName = `${user.firstName} ${user.lastName}`;

	if (deleted) return (<DeletedComment user={user} author={authorDisplayName} />);

	return (
		<Comment
			data-author={user.user}
			author={authorDisplayName}
			isCurrentUserComment={false}
			{...props}
		>
			<UserCirclePopover user={user} />
			<CommentButtons>
				<PrimaryCommentButton onClick={() => onReply(_id)}>
					<ReplyIcon />
				</PrimaryCommentButton>
			</CommentButtons>
		</Comment>
	);
};
