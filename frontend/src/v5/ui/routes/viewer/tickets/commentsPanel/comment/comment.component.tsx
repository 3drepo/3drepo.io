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

import { CurrentUserHooksSelectors, TeamspacesHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { MinimumComment } from '@/v5/store/tickets/tickets.types';
import { getMemberImgSrc, USER_NOT_FOUND } from '@/v5/store/users/users.helpers';
import { UserPopover } from '@components/shared/userPopover/userPopover.component';
import { UserCircle } from '@controls/assignees/assignees.styles';
import { useState } from 'react';
import ReplyIcon from '@assets/icons/outlined/reply_arrow-outlined.svg';
import EditIcon from '@assets/icons/outlined/edit_comment-outlined.svg';
import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import { deletedCommentText, deletedCurrentUserCommentTime, deletedOtherUserCommentTime, getRelativeTime } from './comment.helpers';
import { CurrentUserMessageContainer, CommentAuthor, CommentBody, CommentTime, HoverPopover, OtherUserMessageContainer, CommentButtons } from './comment.styles';
import { ErrorCommentButton, PrimaryCommentButton } from './commentButton/commentButton.styles';
import { CommentMarkDown } from './commentMarkDown/commentMarkDownElements';

type UserCommentProps = Omit<CommentProps, 'createdAt'> & {
	messageAge: string;
}

const CurrentUserMessage = ({
	_id,
	author,
	deleted,
	comment,
	messageAge,
	onDelete,
	onReply,
}: UserCommentProps) => {
	if (deleted) {
		return (
			<CurrentUserMessageContainer $deleted data-author={author}>
				<CommentMarkDown>{deletedCommentText}</CommentMarkDown>
				<CommentTime>{deletedCurrentUserCommentTime}</CommentTime>
			</CurrentUserMessageContainer>
		)
	}

	return (
		<CurrentUserMessageContainer data-author={author}>
			<CommentButtons>
				<ErrorCommentButton onClick={() => onDelete(_id)}>
					<DeleteIcon />
				</ErrorCommentButton>
				<PrimaryCommentButton onClick={() => onReply(_id)}>
					<ReplyIcon />
				</PrimaryCommentButton>
				<PrimaryCommentButton>
					<EditIcon />
				</PrimaryCommentButton>
			</CommentButtons>
			<CommentMarkDown>{comment}</CommentMarkDown>
			<CommentTime>{messageAge}</CommentTime>
		</CurrentUserMessageContainer>
	);
};

const OtherUserMessagePopoverWrapper = ({ deleted = false, user, children }) => (
	<OtherUserMessageContainer $deleted={deleted} data-author={user.user}>
		<HoverPopover anchor={(props) => <UserCircle user={user} {...props} />}>
			<UserPopover user={user} />
		</HoverPopover>
		{children}
	</OtherUserMessageContainer>
);

const OtherUserMessage = ({ _id, deleted, comment, messageAge, author, onReply }: UserCommentProps) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	let user = UsersHooksSelectors.selectUser(teamspace, author);
	if (user) {
		user = { ...user, avatarUrl: getMemberImgSrc(teamspace, user.user), hasAvatar: true };
	} else {
		user = USER_NOT_FOUND;
	}
	if (deleted) {
		return (
			<OtherUserMessagePopoverWrapper deleted user={user}>
				<CommentAuthor>{author}</CommentAuthor>
				<CommentMarkDown>{deletedCommentText}</CommentMarkDown>
				<CommentTime>{deletedOtherUserCommentTime(user.firstName)}</CommentTime>
			</OtherUserMessagePopoverWrapper>
		);
	}

	return (
		<OtherUserMessagePopoverWrapper user={user}>
			<CommentButtons>
				<PrimaryCommentButton onClick={() => onReply(_id)}>
					<ReplyIcon />
				</PrimaryCommentButton>
			</CommentButtons>
			<CommentMarkDown>{comment}</CommentMarkDown>
			<CommentTime>{messageAge}</CommentTime>
		</OtherUserMessagePopoverWrapper>
	);
};

type CommentProps = MinimumComment & {
	commentReply?: MinimumComment;
	onDelete?: (messageId) => void;
	onReply: (messageId) => void;
	onEdit?: (messageId, newMessage) => void;
}

export const Comment = ({ createdAt, author, ...props }: CommentProps) => {
	const [messageAge, _] = useState(getRelativeTime(createdAt));
	const isCurrentUser = CurrentUserHooksSelectors.selectUsername() === author;

	const UserComment = isCurrentUser ? CurrentUserMessage : OtherUserMessage;

	return (<UserComment author={author} {...props} messageAge={messageAge} />);
};