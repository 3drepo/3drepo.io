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
import { getMemberImgSrc, USER_NOT_FOUND } from '@/v5/store/users/users.helpers';
import ReplyIcon from '@assets/icons/outlined/reply_arrow-outlined.svg';
import { CommentReplyMetadata, IComment } from '@/v5/store/tickets/tickets.types';
import { PrimaryCommentButton } from '../commentButton/commentButton.styles';
import { CommentReply } from '../commentReply/commentReply.component';
import { CommentButtons, CommentAuthor } from '../basicCommentWithImages/basicCommentWithImages.styles';
import { CommentContainer, UserCirclePopover } from './otherUserComment.styles';
import { DeletedComment } from './deletedComment/deletedComment.component';

type OtherUserCommentProps = Omit<IComment, 'updatedAt'> & {
	commentAge: string;
	metadata?: CommentReplyMetadata;
	onReply: (commentId) => void;
};
export const OtherUserComment = ({
	_id,
	deleted,
	author,
	history,
	onReply,
	metadata,
	...props
}: OtherUserCommentProps) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	let user = UsersHooksSelectors.selectUser(teamspace, author);
	if (user) {
		user = { ...user, avatarUrl: getMemberImgSrc(teamspace, user.user), hasAvatar: true };
	} else {
		user = USER_NOT_FOUND;
	}
	const authorDisplayName = `${user.firstName} ${user.lastName}`;

	if (deleted) return (<DeletedComment user={user} authorDisplayName={authorDisplayName} />);

	return (
		<CommentContainer data-author={user.user} {...props}>
			<UserCirclePopover user={user} />
			<CommentAuthor>{authorDisplayName}</CommentAuthor>
			{metadata.message && (<CommentReply isCurrentUserComment={false} {...metadata} />)}
			<CommentButtons>
				<PrimaryCommentButton onClick={() => onReply(_id)}>
					<ReplyIcon />
				</PrimaryCommentButton>
			</CommentButtons>
		</CommentContainer>
	);
};
