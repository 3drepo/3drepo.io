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

import { ImagesModal } from '@components/shared/modalsDispatcher/templates/imagesModal/imagesModal.component';
import { getTicketResourceUrl, isResourceId, modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { useParams } from 'react-router-dom';
import { TicketCommentsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { ITicketComment, TicketCommentReplyMetadata } from '@/v5/store/tickets/comments/ticketComments.types';
import { formatMessage } from '@/v5/services/intl';
import { CommentImages } from '../commentImages/commentImages.component';
import { CommentAuthor } from './commentNonMessageContent.styles';
import { CommentReply } from '../commentReply/commentReply.component';
import { DialogsActionsDispatchers, TicketCommentsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useSyncProps } from '@/v5/helpers/syncProps.hooks';
import { ExternalLabel } from '../otherUserComment/importedUserPopover/importedUserPopover.styles';
import { useContext } from 'react';
import { TicketContext } from '../../../../ticket.context';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { uploadImages } from '@controls/fileUploader/uploadImages';

export type CommentNonMessageContentProps = Partial<Omit<ITicketComment, 'history' | '_id'>> & {
	commentId?: string;
	metadata?: TicketCommentReplyMetadata;
	isCurrentUserComment?: boolean;
	hasMessage: boolean;
};
export const CommentNonMessageContent = ({
	commentId,
	author,
	images = [],
	metadata,
	isCurrentUserComment = true,
	hasMessage,
	originalAuthor,
}: CommentNonMessageContentProps) => {
	const { teamspace, project } = useParams<ViewerParams>();
	const { containerOrFederation } = useContext(TicketContext);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const isFederation = modelIsFederation(containerOrFederation);
	const readOnly = TicketsCardHooksSelectors.selectReadOnly() || !isCurrentUserComment;
	const comment = TicketCommentsHooksSelectors.selectCommentById(ticketId, commentId);

	const disabledDeleteMessage = (hasMessage || images.length > 1) ? null : formatMessage({
		id: 'comment.deleteImage.disabled.emptyMessage',
		defaultMessage: 'Cannot delete last image of a comment with no message',
	});

	const imgsSrcs = images.map((img) => {
		if (!isResourceId(img)) return img;
		return getTicketResourceUrl(teamspace, project, containerOrFederation, ticketId, img, isFederation);
	});

	const setImages = (imgs: string[]) => TicketCommentsActionsDispatchers.updateComment(
		teamspace,
		project,
		containerOrFederation,
		ticketId,
		isFederation,
		commentId,
		{ ...comment, images: imgs },
	);
	const onEditImage = (img, index) => {
		const newImages = [...images];
		newImages[index] = img;
		setImages(newImages);
	};

	// @ts-expect-error
	const onDeleteImage = (index) => setImages(images.toSpliced(index, 1));
	const onUploadImages = async () => uploadImages((imagesToUpload) => setImages(images.concat(imagesToUpload)));
	const imagesEditingFunctions = !readOnly ? { 
		onUpload: onUploadImages,
		onDelete: onDeleteImage,
		onAddMarkup: onEditImage,
	} : {};
	const syncProps = useSyncProps({
		images: imgsSrcs,
		disabledDeleteMessage,
		...imagesEditingFunctions,
	});
	const openImagesModal = (index) => DialogsActionsDispatchers.open(ImagesModal, { displayImageIndex: index },  syncProps);

	return (
		<>
			{images.length === 1 && (
				<CommentImages images={imgsSrcs} onImageClick={openImagesModal} />
			)}
			{author && (
				<CommentAuthor>
					{author} {originalAuthor && <ExternalLabel />}
				</CommentAuthor>
			)}
			{metadata && (
				<CommentReply
					originalAuthor={originalAuthor}
					variant={isCurrentUserComment ? 'secondary' : 'primary'}
					{...metadata}
				/>
			)}
			{images.length > 1 && (
				<CommentImages images={imgsSrcs} onImageClick={openImagesModal} />
			)}
		</>
	);
};
