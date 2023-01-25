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
import { useEffect, useState } from 'react';
import ReplyIcon from '@assets/icons/outlined/reply_arrow-outlined.svg';
import EditIcon from '@assets/icons/outlined/edit_comment-outlined.svg';
import TickIcon from '@assets/icons/outlined/tick-outlined.svg';
import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import CancelIcon from '@assets/icons/outlined/cross_sharp_edges-outlined.svg';
import { formatMessage } from '@/v5/services/intl';
import { useForm } from 'react-hook-form';
import { ErrorCommentButton, PrimaryCommentButton } from './commentButton/commentButton.styles';
import { extractMetadata, Metadata, extractComment, updateComment, stringifyComment, parseComment } from './commentMarkDown/commentMarkDown.helpers';
import { CommentReply } from './commentReply/commentReply.component';
import { CommentMarkDown } from './commentMarkDown/commentMarkDown';
import { deletedCommentText, deletedCurrentUserCommentTime, deletedOtherUserCommentTime, getRelativeTime } from './comment.helpers';
import {
	CurrentUserMessageContainer,
	CommentAuthor,
	CommentTime,
	HoverPopover,
	OtherUserMessageContainer,
	CommentButtons,
	EditCommentContainer,
	EditCommentButtons,
	EditCommentInput,
} from './comment.styles';

type UserCommentProps = Omit<CommentProps, 'createdAt'> & {
	commentAge: string;
	metadata?: Metadata;
};

const CurrentUserMessage = ({
	_id,
	author,
	deleted,
	comment,
	commentAge,
	metadata,
	onDelete,
	onReply,
	onEdit,
}: UserCommentProps) => {
	const [isEditMode, setIsEditMode] = useState(false);
	const { control, watch } = useForm<{ editComment }>({
		defaultValues: { editComment: stringifyComment(comment) },
	});

	if (deleted) {
		return (
			<CurrentUserMessageContainer $deleted data-author={author}>
				<CommentMarkDown>{deletedCommentText}</CommentMarkDown>
				<CommentTime>{deletedCurrentUserCommentTime}</CommentTime>
			</CurrentUserMessageContainer>
		);
	}

	if (isEditMode) {
		const updateMessage = () => {
			const newComment = parseComment(watch('editComment'));
			const updatedComment = updateComment(metadata, newComment);
			onEdit(_id, updatedComment);
			setIsEditMode(false);
		};

		return (
			<>
				<EditCommentContainer data-author={author}>
					{metadata.reply && (<CommentReply {...metadata} />)}
					<EditCommentInput
						name="editComment"
						placeholder={formatMessage({
							id: 'customTicket.panel.comments.edit',
							defaultMessage: ' ',
						})}
						control={control}
					/>
				</EditCommentContainer>
				<EditCommentButtons>
					<ErrorCommentButton onClick={() => setIsEditMode(false)}>
						<CancelIcon />
					</ErrorCommentButton>
					<PrimaryCommentButton onClick={updateMessage} disabled={!watch('editComment').length}>
						<TickIcon />
					</PrimaryCommentButton>
				</EditCommentButtons>
			</>
		);
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
				<PrimaryCommentButton onClick={() => setIsEditMode(true)}>
					<EditIcon />
				</PrimaryCommentButton>
			</CommentButtons>
			{metadata.reply && (<CommentReply variant="secondary" {...metadata} />)}
			<CommentMarkDown>{comment}</CommentMarkDown>
			<CommentTime>{commentAge}</CommentTime>
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

const OtherUserMessage = ({ _id, deleted, comment, commentAge, author, onReply, metadata }: UserCommentProps) => {
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
			<CommentAuthor>{author}</CommentAuthor>
			{metadata.reply && (<CommentReply isCurrentUserComment={false} {...metadata} />)}
			<CommentMarkDown>{comment}</CommentMarkDown>
			<CommentTime>{commentAge}</CommentTime>
		</OtherUserMessagePopoverWrapper>
	);
};

type CommentProps = MinimumComment & {
	onDelete?: (messageId) => void;
	onReply: (messageId) => void;
	onEdit?: (messageId, newMessage) => void;
};

export const Comment = ({ createdAt, author, comment: commentWithMetdata, ...props }: CommentProps) => {
	const [commentAge, setCommentAge] = useState(getRelativeTime(createdAt));

	const isCurrentUser = CurrentUserHooksSelectors.selectUsername() === author;
	const metadata = extractMetadata(commentWithMetdata);
	const comment = extractComment(commentWithMetdata);

	const UserComment = isCurrentUser ? CurrentUserMessage : OtherUserMessage;

	useEffect(() => {
		const intervalId = window.setInterval(() => setCommentAge(getRelativeTime(createdAt)), 10_000);
		return () => clearInterval(intervalId);
	}, []);

	return (<UserComment {...props} author={author} commentAge={commentAge} metadata={metadata} comment={comment} />);
};
