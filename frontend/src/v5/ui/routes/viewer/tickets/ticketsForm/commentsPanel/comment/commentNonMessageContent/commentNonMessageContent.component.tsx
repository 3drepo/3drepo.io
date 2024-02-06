/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { getImgSrc } from '@/v5/store/tickets/tickets.helpers';
import { CommentImages } from '../commentImages/commentImages.component';
import { CommentAuthor, SingleImage, CommentImagesContainer } from './commentNonMessageContent.styles';
import { CommentReply } from '../commentReply/commentReply.component';

export type CommentNonMessageContentProps = Partial<Omit<ITicketComment, 'history' | '_id'>> & {
	metadata?: TicketCommentReplyMetadata;
	isCurrentUserComment?: boolean;
};
export const CommentNonMessageContent = ({
	author,
	images = [],
	metadata,
	isCurrentUserComment = true,
}: CommentNonMessageContentProps) => {
	const imagesSrc = images.map(getImgSrc);
	return (
		<>
			{images.length === 1 && (
				<SingleImage
					src={imagesSrc[0]}
					onClick={() => DialogsActionsDispatchers.open('images', { images: imagesSrc })}
				/>
			)}
			{author && (<CommentAuthor>{author}</CommentAuthor>)}
			{metadata && (
				<CommentReply
					variant={isCurrentUserComment ? 'secondary' : 'primary'}
					{...metadata}
				/>
			)}
			{images.length > 1 && (
				<CommentImagesContainer>
					<CommentImages images={imagesSrc} />
				</CommentImagesContainer>
			)}
		</>
	);
};
