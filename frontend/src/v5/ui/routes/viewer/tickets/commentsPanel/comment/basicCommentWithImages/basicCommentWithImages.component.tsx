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

import { getImgSrc } from '@/v5/store/tickets/tickets.helpers';
import { CommentHistoryBlock } from '@/v5/store/tickets/tickets.types';
import { editedCommentMessage } from '../comment.helpers';
import { CommentMarkDown } from '../commentMarkDown/commentMarkDown';
import { BasicComment, BasicCommentProps, CommentAge, EditedCommentLabel } from './basicCommentWithImages.styles';

export type BasicCommentWithImagesProps = BasicCommentProps & {
	images?: string[];
	children?: any;
	className?: string;
	message?: string;
	commentAge: string;
	history?: CommentHistoryBlock;
};
export const BasicCommentWithImages = ({
	images = [],
	children,
	message,
	commentAge,
	...props
}: BasicCommentWithImagesProps) => {
	return (
		<BasicComment {...props}>
			{images.length === 1 && (<img src={getImgSrc(images[0])} />)}
			{history && <EditedCommentLabel>{editedCommentMessage}</EditedCommentLabel>}
			{children}
			{images.length > 1 && (<img src={getImgSrc(images[0])} />)}
			{message && (<CommentMarkDown>{message}</CommentMarkDown>)}
			<CommentAge>{commentAge}</CommentAge>
		</BasicComment>
	);
};
