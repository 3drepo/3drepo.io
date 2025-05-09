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

import { ITicketComment, TicketCommentReplyMetadata } from '@/v5/store/tickets/comments/ticketComments.types';
import { editedCommentMessage } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { CommentMarkDown } from '../commentMarkDown/commentMarkDown.component';
import { CommentContainer, CommentAge, EditedCommentLabel, CommentAgeContent } from './basicComment.styles';
import { CommentNonMessageContent } from '../commentNonMessageContent/commentNonMessageContent.component';
import { getRelativeTime } from '@/v5/helpers/intl.helper';
import { useState, useEffect } from 'react';
import { Tooltip } from '@mui/material';
import { formatDate } from '@/v5/services/intl';

export type BasicCommentProps = Partial<Omit<ITicketComment, 'history' | '_id'>> & {
	children?: any;
	className?: string;
	metadata?: TicketCommentReplyMetadata;
	isCurrentUserComment?: boolean;
	onDeleteImage?: (index) => void;
	onUploadImages?: () => void;
	onEditImage?: (img, index) => void;
};

export const BasicComment = ({
	message,
	createdAt,
	updatedAt,
	className,
	originalAuthor,
	...props
}: BasicCommentProps) => {
	const isEdited = updatedAt && (createdAt !== updatedAt);
	const [commentAge, setCommentAge] = useState('');
	const updateMessageAge = () => setCommentAge(getRelativeTime(updatedAt || createdAt));
	
	useEffect(() => {
		updateMessageAge();
		const intervalId = window.setInterval(updateMessageAge, 10000);
		return () => clearInterval(intervalId);
	}, [updatedAt]);

	return (
		<CommentContainer className={className}>
			<CommentNonMessageContent {...props} originalAuthor={originalAuthor} hasMessage={!!message} />
			{isEdited && !originalAuthor && <EditedCommentLabel>{editedCommentMessage}</EditedCommentLabel>}
			{message && (<CommentMarkDown>{message}</CommentMarkDown>)}
			<CommentAge>
				<Tooltip title={formatDate(updatedAt || createdAt)}>
					<CommentAgeContent>{commentAge}</CommentAgeContent>
				</Tooltip>
			</CommentAge>
		</CommentContainer>
	);
};
