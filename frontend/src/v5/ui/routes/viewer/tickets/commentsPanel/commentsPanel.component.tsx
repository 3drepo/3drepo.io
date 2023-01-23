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
import SendIcon from '@assets/icons/outlined/send_message-outlined.svg';
import FileIcon from '@assets/icons/outlined/file-outlined.svg';
import { formatMessage } from '@/v5/services/intl';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { CurrentUserHooksSelectors, TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Comment } from './comment/comment.component';
import { ScrollArea } from '@controls/scrollArea';
import { FormattedMessage } from 'react-intl';
import { MinimumComment } from '@/v5/store/tickets/tickets.types';
import DeleteIcon from '@assets/icons/outlined/close-outlined.svg';
import { useEffect, useState } from 'react';
import { ViewerParams } from '../../../routes.constants';
import {
	Accordion,
	Comments,
	Controls,
	CharsCounter,
	FileIconButton,
	SendButton,
	BottomSection,
	MessageInput,
	EmptyCommentsBox,
	DeleteButton,
	CommentReplyContainer,
} from './commentsPanel.styles';
import { addAuthor, addReply } from './comment/commentMarkDown/commentMarkDown.helpers';
import { MDCommentReply } from './comment/commentMarkDown/markDownElements/markDownComponents.component';
import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';

const CHARS_LIMIT = 1200;

const commentsNotStateAll: Partial<MinimumComment>[] = [
	{
		// teamspace: 'localuser1',
		author: 'localuser2',
		comment: 'A comment from an external user',
		createdAt: new Date('12 12 2021'),
		deleted: false,
	},
	{
		// teamspace: 'localuser1',
		author: 'localuser1',
		comment: 'This is n current user comment',
		createdAt: new Date('1 1 2022'),
		deleted: false,
	},
	{
		// teamspace: 'localuser1',
		author: 'localuser1',
		comment: 'short',
		createdAt: new Date('1 1 2022'),
		deleted: false,
	},
	{
		// teamspace: 'localuser1',
		author: 'localuser1',
		comment: 'Super duper uper bonder longgggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg sdfs dfs dfs df sdf sd fs df sdf sdf sdfsd fsdf sdf sdf sdf sdf sdf sdf sdf sdf sdf sdf sdf sdf sdf sdf ',
		createdAt: new Date('1 1 2022'),
		deleted: false,
	},
	{
		// teamspace: 'localuser1',
		author: 'localuser2',
		comment: 'A comment from an external user',
		createdAt: new Date('1 23 2022'),
		deleted: false,
	},
	{
		// teamspace: 'localuser1',
		author: 'localuser2',
		comment: 'A comment from an external user',
		createdAt: new Date('4 1 2022'),
		deleted: false,
	},
	{
		// teamspace: 'localuser1',
		author: 'inviteUser1',
		comment: 'A comment from an external user',
		createdAt: new Date('4 1 2022'),
		deleted: false,
	},
	{
		// teamspace: 'localuser1',
		author: 'localuser1',
		comment: 'This is n current user comment',
		createdAt: new Date('1 1 2023'),
		deleted: false,
	},
	{
		// teamspace: 'localuser1',
		author: 'localuser1',
		comment: 'This is n current user comment',
		createdAt: new Date('1 17 2023'),
		deleted: true,
	},
	{
		// teamspace: 'localuser1',
		author: 'localuser1',
		comment: 'This is n current user comment',
		createdAt: new Date(2023, 0, 18, 10),
		deleted: false,
	},
	{
		// teamspace: 'localuser1',
		author: 'inviteUser1',
		comment: 'A comment from an external user',
		createdAt: new Date(2023, 0, 18, 13),
		deleted: true,
	},
	{
		// teamspace: 'localuser1',
		author: 'inviteUser1',
		comment: 'A comment from an external user',
		createdAt: new Date(2023, 0, 18, 15),
		deleted: false,
	},
	{
		// teamspace: 'localuser1',
		author: 'localuser2',
		comment: 'This is n current user comment',
		createdAt: new Date(2023, 0, 18, 17),
		deleted: true,
	},
].map((x, index) => ({ ...x, _id: index+"" }));

export const CommentsPanel = () => {
	const [comments, setComments] = useState(commentsNotStateAll);
	const [commentReply, setCommentReply] = useState(null);
	const formData = useForm<{ comment: string }>({ mode: 'all' });
	const inputComment = formData.watch('comment');

	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();

	const currentUser = CurrentUserHooksSelectors.selectCurrentUser();

	const charsCount = inputComment?.length || 0;
	const charsLimitIsReached = charsCount >= CHARS_LIMIT;
	const commentsListIsEmpty = comments?.length > 0;

	const handleDeleteComment = (commentId) => {
		// setComments(comments.map((comment) => {
		// 	if (comment._id !== commentId) return comment;
		// 	return {
		// 		...comment,
		// 		deleted: true,
		// 	} 
		// }));
	};

	const handleReplyToComment = (commentId) => {
		const { comment } = comments.find(({ _id }) => _id === commentId);
		setCommentReply(comment);
	};

	const handleEditToComment = (commentId, newComment: { comment?: string, images?: string[] }) => {
		// setComments(comments.map((comment) => {
		// 	if (comment._id !== commentId) return comment;
		// 	return { ...comment, ...newComment }; 
		// }));
	};
	
	const createComment = async () => {
		// let s, p;
		// try {
		// 	s = await createFederationComment(
		// 		teamspace,
		// 		project,
		// 		containerOrFederation,
		// 		ticketId,
		// 		message,
		// 	)
		// } catch (e) {
		// 	alert("single fails")
		// }
		// try {
		// 	p = await createFederationsComment(
		// 		teamspace,
		// 		project,
		// 		containerOrFederation,
		// 		ticketId,
		// 		message,
		// 	)
		// } catch (e) {
		// 	alert("plural fails")
		// }
		let comment = inputComment;
		if (commentReply) {
			comment = addReply(commentReply, comment); 
		}
		const author = currentUser.username;
		comment = addAuthor(author, comment);
		const newComment: MinimumComment = {
			_id: commentsNotStateAll.length + 1 + "",
			author,
			comment,
			images: [],
			createdAt: new Date(),
			deleted: false,
		};
		// setComments(comments.concat(newComment));
		setCommentReply(null);
		formData.reset();
	};

	return (
		<Accordion
			title={formatMessage({ id: 'customTicket.panel.comments', defaultMessage: 'Comments' })}
			Icon={CommentIcon}
		>
			<FormProvider {...formData}>
				<ScrollArea autoHeight autoHeightMin={400} autoHeightMax={400}>
					{commentsListIsEmpty && (
						<Comments>
							{comments.map((comment) => (
								<Comment
									{...comment}
									key={comment._id}
									onDelete={handleDeleteComment}
									onReply={handleReplyToComment}
									onEdit={handleEditToComment}
									commentReply={commentReply}
								/>
							))}
						</Comments>
					)}
					{!commentsListIsEmpty && (
						<EmptyCommentsBox>
							<FormattedMessage id="ticket.comments.empty" defaultMessage='No comments' />
						</EmptyCommentsBox>
					)}
				</ScrollArea>
				<BottomSection>
					{commentReply && (
						<CommentReplyContainer>
							<MDCommentReply>{commentReply}</MDCommentReply>
							<DeleteButton onClick={() => setCommentReply(null)}>
								<DeleteIcon />
							</DeleteButton>
						</CommentReplyContainer>
					)}
					<MessageInput
						name='comment'
						placeholder={formatMessage({
							id: 'customTicket.panel.comments.leaveAMessage',
							defaultMessage: 'leave a message',
						})}
						inputProps={{ maxlength: 1200 }}
					/>
					{/* <Images /> */}
					<Controls>
						<FileIconButton>
							<FileIcon />
						</FileIconButton>
						<CharsCounter $error={charsLimitIsReached}>{charsCount}/{CHARS_LIMIT}</CharsCounter>
						<SendButton disabled={!charsCount} onClick={createComment}>
							<SendIcon />
						</SendButton>
					</Controls>
				</BottomSection>
			</FormProvider>
		</Accordion>
	);
};
