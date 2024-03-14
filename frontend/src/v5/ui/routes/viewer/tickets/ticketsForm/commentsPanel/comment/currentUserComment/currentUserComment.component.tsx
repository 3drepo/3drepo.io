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

import { useState } from 'react';
import ReplyIcon from '@assets/icons/outlined/reply_arrow-outlined.svg';
import EditIcon from '@assets/icons/outlined/edit_comment-outlined.svg';
import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import { TicketCommentReplyMetadata, ITicketComment } from '@/v5/store/tickets/comments/ticketComments.types';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { uploadFile } from '@controls/fileUploader/uploadFile';
import { convertFileToImageSrc, getSupportedImageExtensions, testImageExists } from '@controls/fileUploader/imageFile.helper';
import { imageIsTooBig } from '@/v5/store/tickets/comments/ticketComments.helpers';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { clientConfigService } from '@/v4/services/clientConfig';
import { TicketButton } from '../../../../ticketButton/ticketButton.styles';
import { Comment, CommentWithButtonsContainer } from './currentUserComment.styles';
import { EditComment } from './editComment/editComment.component';
import { DeletedComment } from './deletedComment/deletedComment.component';
import { CommentButtons } from '../basicComment/basicComment.styles';

export type CurrentUserCommentProps = ITicketComment & {
	commentAge: string;
	metadata?: TicketCommentReplyMetadata;
	isFirstOfBlock: boolean;
	onDelete: (commentId) => void;
	onReply: (commentId) => void;
	onEdit: (commentId, newMessage, newImages) => void;
};
export const CurrentUserComment = ({
	_id,
	author,
	deleted,
	message,
	metadata,
	images,
	onDelete,
	onReply,
	onEdit,
	...props
}: CurrentUserCommentProps) => {
	const [isEditMode, setIsEditMode] = useState(false);
	const readOnly = TicketsCardHooksSelectors.selectReadOnly();

	const onEditImage = (img, index) => {
		const newImages = [...images];
		newImages[index] = img;
		onEdit(_id, message, newImages);
	};

	// @ts-ignore
	const onDeleteImage = (index) => onEdit(_id, message, images.toSpliced(index, 1));

	const onUploadImages = async () => {
		const files = await uploadFile(getSupportedImageExtensions(), true) as File[];
		const imagesToUpload = [];
		let corruptedImagesCount = 0;
		let imagesTooBigCount = 0;
		for (const file of files) {
			if (imageIsTooBig(file)) {
				imagesTooBigCount++;
				continue;
			}
			try {
				const imgSrc = await convertFileToImageSrc(file) as string;
				await testImageExists(imgSrc);
				imagesToUpload.push(imgSrc);
			} catch (e) {
				corruptedImagesCount++;
			}
		}
		if (imagesToUpload.length) {
			onEdit(_id, message, images.concat(imagesToUpload));
		}
		if (imagesTooBigCount) {
			DialogsActionsDispatchers.open('warning', {
				title: formatMessage({
					defaultMessage: 'Max file size exceeded',
					id: 'comment.uploadImages.error.imageTooBig.title',
				}),
				message: formatMessage({
					defaultMessage: `
						{imagesTooBigCount} {imagesTooBigCount, plural, one {file was} other {files were}} too big and could not be uploaded.
						The max file size is {maxFileSize}`,
					id: 'comment.uploadImages.error.imageTooBig.message',
				}, { imagesTooBigCount, maxFileSize: clientConfigService.resourceUploadSizeLimit }),
			});
		}
		if (corruptedImagesCount) {
			DialogsActionsDispatchers.open('warning', {
				title: formatMessage({
					defaultMessage: 'Invalid images',
					id: 'comment.uploadImages.error.corruptedImage.title',
				}),
				message: formatMessage({
					defaultMessage: '{corruptedImagesCount} {corruptedImagesCount, plural, one {file was} other {files were}} corrupted and could not be uploaded.',
					id: 'comment.uploadImages.error.corruptedImage.message',
				}, { corruptedImagesCount }),
			});
		}
	};
	const imagesEditingFunctions = { onDeleteImage, onUploadImages, onEditImage };

	if (deleted) return (<DeletedComment author={author} />);

	if (isEditMode) {
		return (
			<EditComment
				message={message}
				images={images}
				author={author}
				metadata={metadata}
				onEditMessage={(newMessage) => onEdit(_id, newMessage, images)}
				{...imagesEditingFunctions}
				onClose={() => setIsEditMode(false)}
			/>
		);
	}

	return (
		<CommentWithButtonsContainer>
			{!readOnly && (
				<CommentButtons>
					<TicketButton variant="error" onClick={() => onDelete(_id)}>
						<DeleteIcon />
					</TicketButton>
					<TicketButton variant="primary" onClick={() => onReply(_id)}>
						<ReplyIcon />
					</TicketButton>
					<TicketButton variant="primary" onClick={() => setIsEditMode(true)}>
						<EditIcon />
					</TicketButton>
				</CommentButtons>
			)}
			<Comment
				message={message}
				images={images}
				metadata={metadata}
				{...(!readOnly ? imagesEditingFunctions : {})}
				{...props}
			/>
		</CommentWithButtonsContainer>
	);
};
