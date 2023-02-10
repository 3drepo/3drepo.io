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

import { TicketCommentHistoryBlock } from '@/v5/store/tickets/comments/ticketComments.types';
import { editedCommentMessage } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { getImgSrc } from '@/v5/store/tickets/tickets.helpers';
import { CommentImages } from '../commentImages/commentImages.component';
import { CommentMarkDown } from '../commentMarkDown/commentMarkDown';
import { BasicComment, CommentAge, CommentAuthor, EditedCommentLabel, SingleImage, CommentImagesContainer } from './basicCommentWithImages.styles';

export type BasicCommentWithImagesProps = {
	images?: string[];
	children?: any;
	className?: string;
	message?: string;
	commentAge: string;
	history?: TicketCommentHistoryBlock[];
	author?: string;
	'data-author': string,
};
export const BasicCommentWithImages = ({
	author,
	images,
	children,
	message,
	commentAge,
	history,
	...props
}: BasicCommentWithImagesProps) => {
	const imagesSrc = images.map(getImgSrc);
	return (
		<BasicComment {...props}>
			{images.length === 1 && (
				<SingleImage
					src={imagesSrc[0]}
					onClick={() => DialogsActionsDispatchers.open('images', { images: imagesSrc })}
				/>
			)}
			{author && (<CommentAuthor>{author}</CommentAuthor>)}
			{children}
			{images.length > 1 && (
				<CommentImagesContainer>
					<CommentImages images={imagesSrc} />
				</CommentImagesContainer>
			)}
			{history?.length && <EditedCommentLabel>{editedCommentMessage}</EditedCommentLabel>}
			{message && (<CommentMarkDown>{message}</CommentMarkDown>)}
			<CommentAge>{commentAge}</CommentAge>
		</BasicComment>
	);
};
