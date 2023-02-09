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

import { FormattedMessage } from 'react-intl';
import { deletedCommentMessage } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { CommentAge, CommentMessage } from '../../basicCommentWithImages/basicCommentWithImages.styles';
import { CommentContainer } from './deletedComment.styles';

export const DeletedComment = ({ author }) => (
	<CommentContainer data-author={author}>
		<CommentMessage>{deletedCommentMessage}</CommentMessage>
		<CommentAge>
			<FormattedMessage
				id="ticket.currentUser.comment.time.deleted"
				defaultMessage="You deleted this message"
			/>
		</CommentAge>
	</CommentContainer>
);
