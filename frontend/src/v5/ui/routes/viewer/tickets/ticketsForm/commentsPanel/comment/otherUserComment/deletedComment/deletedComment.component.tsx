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

import { deletedCommentMessage } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { Comment } from './deletedComment.styles';
import { CommentAge, CommentMessage } from '../../basicComment/basicComment.styles';
import { FormattedMessage } from 'react-intl';

export const DeletedComment = ({ user, author, isFirstOfBlock }) => (
	<Comment author={author} isFirstOfBlock={isFirstOfBlock}>
		<CommentMessage>{deletedCommentMessage}</CommentMessage>
		<CommentAge>
			<FormattedMessage
				id="customTicket.otherUser.comment.time.deleted"
				defaultMessage="{name} deleted this message"
				values={{ name: user.firstName }}
			/>
		</CommentAge>
	</Comment>
);
