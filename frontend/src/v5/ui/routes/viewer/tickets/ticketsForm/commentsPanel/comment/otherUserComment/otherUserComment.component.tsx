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

import { TeamspacesHooksSelectors, TicketsCardHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import ReplyIcon from '@assets/icons/outlined/reply_arrow-outlined.svg';
import { TicketCommentReplyMetadata, ITicketComment } from '@/v5/store/tickets/comments/ticketComments.types';
import { TicketButton } from '../../../../ticketButton/ticketButton.styles';
import { Comment, AuthorAvatar, ImportedAuthorAvatar } from './otherUserComment.styles';
import { DeletedComment } from './deletedComment/deletedComment.component';
import { CommentButtons, CommentWithButtonsContainer } from '../basicComment/basicComment.styles';
import { getFullnameFromUser, getImportedUser } from '@/v5/store/users/users.helpers';

type OtherUserCommentProps = ITicketComment & {
	isFirstOfBlock: boolean;
	metadata?: TicketCommentReplyMetadata;
	onReply: (commentId) => void;
};
export const OtherUserComment = ({
	_id,
	deleted,
	author, // The author of a non-imported comment. Or who imported the comment
	originalAuthor, // The author of the comment if it was imported
	onReply,
	isFirstOfBlock,
	importedAt,
	...props
}: OtherUserCommentProps) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const imported = !!originalAuthor;
	const authorUser = UsersHooksSelectors.selectUser(teamspace, author);
	const importedAuthorUser = getImportedUser(originalAuthor);
	const readOnly = TicketsCardHooksSelectors.selectReadOnly();

	const getAuthorDisplayName = () => {
		if (!isFirstOfBlock) return null;
		return getFullnameFromUser(originalAuthor ? importedAuthorUser : authorUser);
	};

	const Avatar = () => {
		if (!imported) return <AuthorAvatar user={authorUser} />;
		return (
			<ImportedAuthorAvatar
				importedBy={getFullnameFromUser(authorUser)}
				author={importedAuthorUser}
				importedAt={importedAt}
			/>
		);
	};

	return (
		<CommentWithButtonsContainer>
			{isFirstOfBlock && <Avatar />}
			{deleted ? (
				<DeletedComment
					user={authorUser}
					author={getAuthorDisplayName()}
					isFirstOfBlock={isFirstOfBlock}
				/>
			) : (
				<>
					<Comment
						commentId={_id}
						author={getAuthorDisplayName()}
						isCurrentUserComment={false}
						isFirstOfBlock={isFirstOfBlock}
						originalAuthor={originalAuthor}
						{...props}
					/>
					{!readOnly && (
						<CommentButtons>
							<TicketButton variant="primary" onClick={() => onReply(_id)}>
								<ReplyIcon />
							</TicketButton>
						</CommentButtons>
					)}
				</>
			)}
		</CommentWithButtonsContainer>
	);
};
